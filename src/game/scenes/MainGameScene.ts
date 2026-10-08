import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { Character } from '../objects/Character';
import { TempleGate } from '../objects/TempleGate';
import { LevelGenerator } from '../systems/LevelGenerator';
import { WordManager } from '../systems/WordManager';
import { AtmosphereSystem } from '../systems/AtmosphereSystem';
import { JumpPhysics } from '../systems/JumpPhysics';
import { audioManager } from '../systems/AudioManager';
import { Coin } from '../objects/Coin';
import { GameStats, ActiveWordState } from '../../types/game';

export interface SceneCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onActiveWordUpdate: (wordState: ActiveWordState) => void;
  onGameOver: (finalStats: GameStats) => void;
}

export class MainGameScene extends Phaser.Scene {
  private character!: Character;
  private levelGenerator!: LevelGenerator;
  private wordManager!: WordManager;
  private atmosphereSystem!: AtmosphereSystem;

  // Single static physics groups — created ONCE to prevent collider leaks
  private platformGroup!: Phaser.Physics.Arcade.StaticGroup;
  private gateGroup!: Phaser.Physics.Arcade.StaticGroup;
  private coinGroup!: Phaser.Physics.Arcade.StaticGroup;

  // Background Parallax Layers
  private bgLayers: Phaser.GameObjects.TileSprite[] = [];
  private foregroundLayer!: Phaser.GameObjects.TileSprite;

  // State
  private isGameActive = false;
  private isGameOver = false;
  private startX = 0;
  private score = 0;
  private coinsCount = 0;
  private comboStreak = 0;
  private maxCombo = 0;
  private elapsedMs = 0;
  private wordScore = 0;
  private statsThrottleTimer = 0;

  // Target Gate tracking
  private activeTargetGate: TempleGate | null = null;
  private isWordClearedForCurrentPlatform = false;

  private callbacks: SceneCallbacks = {
    onStatsUpdate: () => {},
    onActiveWordUpdate: () => {},
    onGameOver: () => {},
  };

  constructor() {
    super({ key: 'MainGameScene' });
  }

  public init(data: { callbacks?: SceneCallbacks }) {
    if (data.callbacks) {
      this.callbacks = data.callbacks;
    }
  }

  public setCallbacks(callbacks: SceneCallbacks) {
    this.callbacks = callbacks;
  }

  public create() {
    this.isGameActive = false;
    this.isGameOver = false;
    this.score = 0;
    this.coinsCount = 0;
    this.comboStreak = 0;
    this.maxCombo = 0;
    this.isWordClearedForCurrentPlatform = false;
    this.activeTargetGate = null;
    this.elapsedMs = 0;
    this.wordScore = 0;
    this.statsThrottleTimer = 0;
    this.bgLayers = [];

    // 1. Systems setup
    this.wordManager = new WordManager();
    this.atmosphereSystem = new AtmosphereSystem(this);
    this.levelGenerator = new LevelGenerator(this, this.wordManager);

    // 2. Parallax Background Layers
    this.createParallaxBackgrounds();

    // 3. Atmosphere & Volumetric Lighting
    this.atmosphereSystem.create();

    // 4. Create Single Static Physics Groups
    this.platformGroup = this.physics.add.staticGroup();
    this.gateGroup = this.physics.add.staticGroup();
    this.coinGroup = this.physics.add.staticGroup();

    // 5. Generate World Platforms
    this.levelGenerator.init(this.platformGroup, this.gateGroup, this.coinGroup);

    // 6. Character setup
    this.character = new Character(this, GAME_CONFIG.PLAYER.START_X, GAME_CONFIG.WORLD.FLOOR_Y - 90);
    this.startX = this.character.x;

    // 7. Setup Physics Colliders ONCE (no duplicate leaks)
    this.setupSinglePhysicsColliders();

    // 8. Sync initial target word with first gate ahead
    this.syncActiveGateAhead();

    // 9. Camera Follow (keeps player at 28% from the left edge)
    this.cameras.main.startFollow(this.character, false, 0.1, 0, -260, 0);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, GAME_CONFIG.CANVAS_HEIGHT);

    // 10. Keyboard Input Listeners
    this.setupKeyboardInput();

    // Ready to start running
    this.startRunning();
    this.game.events.emit("skillrush-ready", this);
  }

  private createParallaxBackgrounds() {
    const w = 1280;
    const h = 720;

    // Layer 1: Sky (fixed distant)
    const sky = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_sky');
    sky.setScrollFactor(0);
    sky.setDepth(0);
    this.bgLayers.push(sky);

    // Layer 2: Mountains
    const mountains = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_mountains');
    mountains.setScrollFactor(0);
    mountains.setDepth(2);
    this.bgLayers.push(mountains);

    // Layer 3: Ancient Temple Ruins
    const temples = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_temple');
    temples.setScrollFactor(0);
    temples.setDepth(4);
    this.bgLayers.push(temples);

    // Layer 4: Waterfalls
    const waterfalls = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_waterfalls');
    waterfalls.setScrollFactor(0);
    waterfalls.setDepth(6);
    this.bgLayers.push(waterfalls);

    // Layer 5: Mid Jungle Canopy
    const midJungle = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_mid_jungle');
    midJungle.setScrollFactor(0);
    midJungle.setDepth(9);
    midJungle.setAlpha(0.6);
    this.bgLayers.push(midJungle);

    // Layer 6: Foreground Jungle Vines (zooms in front of camera)
    this.foregroundLayer = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_foreground_jungle');
    this.foregroundLayer.setScrollFactor(0);
    this.foregroundLayer.setDepth(50);
    // Keep the explorer and obstacle silhouettes clear beneath the vines.
    this.foregroundLayer.setAlpha(0.16);
  }

  private setupSinglePhysicsColliders() {
    // 1. Single platform ground collider
    this.physics.add.collider(this.character, this.platformGroup, () => {
      const body = this.character.body as Phaser.Physics.Arcade.Body;
      if (body.blocked.down && this.character.getState() === 'JUMPING') {
        this.character.onLanded();
        this.atmosphereSystem.spawnDustPuff(this.character.x, this.character.y + 60, 5);

        // When safely landing on new platform, sync to upcoming gate!
        this.syncActiveGateAhead();
      }
    });

    // 2. Single closed wall overlap
    this.physics.add.overlap(this.character, this.gateGroup, (_char, gateZone) => {
      // Find gate associated with this zone
      const platforms = this.levelGenerator.getPlatforms();
      const hitPlatform = platforms.find(p => p.gate && p.gate.colliderZone === gateZone);
      if (hitPlatform && hitPlatform.gate && !hitPlatform.gate.getIsOpen()) {
        this.handlePlayerCrashedIntoGate();
      }
    });

    // 3. Single coin collection overlap
    this.physics.add.overlap(this.character, this.coinGroup, (_char, coinObj) => {
      this.handleCoinCollected(coinObj as Coin);
    });
  }

  private syncActiveGateAhead() {
    const nextGate = this.levelGenerator.getNextGateAhead(this.character.x);
    if (nextGate && nextGate !== this.activeTargetGate) {
      this.activeTargetGate = nextGate;
      this.wordManager.setTargetWord(nextGate.getTargetWord());
      this.isWordClearedForCurrentPlatform = false;
      this.updateActiveWordUI(false);
    }
  }

  private setupKeyboardInput() {
    const onKey = (event: KeyboardEvent) => {
      if (!this.isGameActive || this.isGameOver || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.matches('input, textarea') || target.isContentEditable)) return;
      this.handleTypingInput(event.key);
    };
    this.input.keyboard?.on('keydown', onKey);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', onKey);
    });
  }

  public handleTypingInput(key: string) {
    if (!this.isGameActive || this.isGameOver) return;

    const result = this.wordManager.handleKeyInput(key);

    if (result === 'CORRECT') {
      audioManager.playTypeCorrect();
      this.updateActiveWordUI(false);
    } else if (result === 'WRONG') {
      audioManager.playTypeWrong();
      this.comboStreak = 0; // Reset combo on mistake
      this.atmosphereSystem.triggerImpactShake(0.005, 100);
      this.atmosphereSystem.triggerTypoFlash();
      this.updateActiveWordUI(true);
    } else if (result === 'BACKSPACE') {
      audioManager.playTypeCorrect();
      this.updateActiveWordUI(false);
    } else if (result === 'COMPLETED') {
      this.handleWordSuccessfullyCompleted();
    }
  }

  private handleWordSuccessfullyCompleted() {
    audioManager.playTypeCorrect();
    this.atmosphereSystem.triggerWordSolvedFlash();

    // Reward combo & score
    this.comboStreak++;
    if (this.comboStreak > this.maxCombo) {
      this.maxCombo = this.comboStreak;
    }
    const comboBonus = Math.min(500, this.comboStreak * 50);
    this.wordScore += 200 + comboBonus;

    // Collapse the active gate into stone debris!
    if (this.activeTargetGate) {
      this.activeTargetGate.collapseAndOpen((x, y) => {
        this.atmosphereSystem.spawnGateDebris(x, y);
      });
    }

    this.isWordClearedForCurrentPlatform = true;
    this.updateActiveWordUI(false, true);

    // Floating Combo notification
    if (this.comboStreak >= 3) {
      this.atmosphereSystem.spawnCoinCollectionFX(
        this.character.x,
        this.character.y - 40,
        `COMBO x${this.comboStreak}!`
      );
    }
  }

  private handleCoinCollected(coin: Coin) {
    if (this.isGameOver) return;
    const collected = coin.collect();
    if (collected) {
      this.coinsCount++;
      this.score += 100;
      audioManager.playCoin();
      this.atmosphereSystem.spawnCoinCollectionFX(coin.x, coin.y, '+100');
    }
  }

  private handlePlayerCrashedIntoGate() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.isGameActive = false;

    this.character.triggerCollision();
    this.atmosphereSystem.triggerImpactShake(0.025, 450);
    audioManager.playGameOver();

    this.time.delayedCall(1200, () => {
      this.callbacks.onGameOver(this.compileStats());
    });
  }

  private handlePlayerFellIntoAbyss() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.isGameActive = false;

    this.character.triggerFall();
    this.atmosphereSystem.triggerImpactShake(0.015, 300);
    audioManager.playGameOver();

    this.time.delayedCall(1200, () => {
      this.callbacks.onGameOver(this.compileStats());
    });
  }

  private startRunning() {
    this.isGameActive = true;
    this.character.startRunning();
    audioManager.startMusic();
    this.updateActiveWordUI(false);
  }

  public update(time: number, delta: number) {
    if (!this.isGameActive && !this.isGameOver) return;

    // 1. Atmosphere updates (drifting mist, god rays)
    this.atmosphereSystem.update(time, delta);

    // 2. Parallax background manual scrolls
    const camScrollX = this.cameras.main.scrollX;
    this.bgLayers.forEach((bg, idx) => {
      const factors = [0, 0.08, 0.18, 0.28, 0.48];
      bg.tilePositionX = camScrollX * factors[idx];
    });
    this.foregroundLayer.tilePositionX = camScrollX * GAME_CONFIG.PARALLAX.FOREGROUND_VINES;

    if (this.isGameOver) return;
    this.elapsedMs += delta;

    // 3. Dynamic speed scaling based on WPM
    const currentWPM = this.wordManager.getSmoothedWPM();
    const dynamicSpeed = GAME_CONFIG.PLAYER.BASE_SPEED + Math.min(100, Math.max(0, (currentWPM - 25) * 1.4));
    this.character.setSpeed(dynamicSpeed);

    // 4. Update character movement & footstep particles
    this.character.updateMovement(delta, (x, y) => {
      this.atmosphereSystem.spawnDustPuff(x, y, 2);
    });

    // 5. Update procedural level platforms ahead & cleanup behind
    this.levelGenerator.update(camScrollX, dynamicSpeed);

    // 6. Check Jump Takeoff Threshold near platform edge!
    const activePlatform = this.levelGenerator.getActivePlatformForX(this.character.x);
    if (activePlatform) {
      // If gate has been opened and character is near edge -> TRIGGER JUMP!
      if (this.isWordClearedForCurrentPlatform) {
        if (this.character.getState() === 'RUNNING' && JumpPhysics.isAtTakeoffPoint(this.character.x, activePlatform.rightX)) {
          this.character.performJump();
          this.atmosphereSystem.spawnDustPuff(this.character.x, this.character.y + 60, 6);
          this.isWordClearedForCurrentPlatform = false; // Reset for next platform
        }
      }
    }

    // 7. Check if fallen below abyss floor
    if (this.character.y > GAME_CONFIG.WORLD.FLOOR_Y + 110) {
      this.handlePlayerFellIntoAbyss();
      return;
    }

    // 8. Distance score increments
    const currentDistance = Math.max(0, Math.round((this.character.x - this.startX) / 10));
    this.score = currentDistance * 2 + this.coinsCount * 100 + this.wordScore;

    // 9. Throttle stats dispatch to React UI (~10Hz)
    this.statsThrottleTimer += delta;
    if (this.statsThrottleTimer > 100) {
      this.statsThrottleTimer = 0;
      this.callbacks.onStatsUpdate(this.compileStats());
    }
  }

  private updateActiveWordUI(isError: boolean, isCompleted = false) {
    const word = this.wordManager.getCurrentWord();
    const typed = this.wordManager.getTypedInput();

    // Update active gate banner in Phaser
    if (this.activeTargetGate) {
      this.activeTargetGate.updateWordDisplay(word, typed, isError);
    }

    // Dispatch to React HUD
    this.callbacks.onActiveWordUpdate({
      word,
      typed,
      isError,
      isCompleted,
    });
  }

  private compileStats(): GameStats {
    const wmStats = this.wordManager.getStats();
    const distanceMeters = Math.max(0, Math.round((this.character.x - this.startX) / 10));
    const elapsedSeconds = Math.max(1, Math.round(this.elapsedMs / 1000));

    return {
      score: distanceMeters * 2 + this.coinsCount * 100 + this.wordScore,
      distance: distanceMeters,
      currentWPM: wmStats.smoothedWPM,
      averageWPM: wmStats.smoothedWPM,
      peakWPM: wmStats.peakWPM,
      accuracy: wmStats.accuracy,
      wordsCompleted: wmStats.totalWordsCompleted,
      totalKeystrokes: wmStats.totalKeystrokes,
      wrongKeystrokes: wmStats.wrongKeystrokes,
      coinsCollected: this.coinsCount,
      comboStreak: this.comboStreak,
      maxCombo: this.maxCombo,
      durationSeconds: elapsedSeconds,
    };
  }

  public publishState() {
    this.updateActiveWordUI(false);
    this.callbacks.onStatsUpdate(this.compileStats());
  }

  public pauseGame() {
    if (!this.isGameActive || this.isGameOver) return;
    this.isGameActive = false;
    this.wordManager.pause();
    audioManager.stopMusic();
    this.scene.pause();
  }

  public resumeGame() {
    if (this.isGameOver || this.isGameActive) return;
    this.wordManager.resume();
    this.isGameActive = true;
    this.scene.resume();
    audioManager.startMusic();
  }

  public restartGame() {
    this.scene.resume();
    this.scene.restart();
  }
}
