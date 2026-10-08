import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { Character } from '../objects/Character';
import { TempleGate } from '../objects/TempleGate';
import { LevelGenerator } from '../systems/LevelGenerator';
import { WordManager } from '../systems/WordManager';
import { AtmosphereSystem } from '../systems/AtmosphereSystem';
import { JumpPhysics } from '../systems/JumpPhysics';
import { audioManager } from '../systems/AudioManager';
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
  private gameStartTime = 0;
  private statsThrottleTimer = 0;

  // Active platform and word
  private currentPlatformIndex = 0;
  private nextGateToClear: TempleGate | null = null;
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
    this.gameStartTime = performance.now();

    // 1. Systems setup
    this.wordManager = new WordManager();
    this.atmosphereSystem = new AtmosphereSystem(this);
    this.levelGenerator = new LevelGenerator(this, this.wordManager);

    // 2. Parallax Background Layers
    this.createParallaxBackgrounds();

    // 3. Atmosphere & Lighting
    this.atmosphereSystem.create();

    // 4. Character
    this.character = new Character(this, GAME_CONFIG.PLAYER.START_X, GAME_CONFIG.WORLD.FLOOR_Y - 90);
    this.startX = this.character.x;

    // 5. Generate World Platforms
    this.levelGenerator.init();

    // 6. Camera Follow (keeps player at 28% from the left edge)
    this.cameras.main.startFollow(this.character, false, 0.1, 0, -260, 0);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, GAME_CONFIG.CANVAS_HEIGHT);

    // 7. Physics Colliders
    this.setupPhysicsColliders();

    // 8. Keyboard Input Listeners
    this.setupKeyboardInput();

    // Ready to start
    this.startRunning();
  }

  private createParallaxBackgrounds() {
    const w = 1280;
    const h = 720;

    // Layer 1: Sky (fixed distant)
    const sky = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_sky');
    sky.setScrollFactor(GAME_CONFIG.PARALLAX.SKY);
    sky.setDepth(0);
    this.bgLayers.push(sky);

    // Layer 2: Mountains
    const mountains = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_mountains');
    mountains.setScrollFactor(GAME_CONFIG.PARALLAX.MOUNTAINS);
    mountains.setDepth(2);
    this.bgLayers.push(mountains);

    // Layer 3: Ancient Temple Ruins
    const temples = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_temple');
    temples.setScrollFactor(GAME_CONFIG.PARALLAX.TEMPLES);
    temples.setDepth(4);
    this.bgLayers.push(temples);

    // Layer 4: Waterfalls
    const waterfalls = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_waterfalls');
    waterfalls.setScrollFactor(GAME_CONFIG.PARALLAX.WATERFALLS);
    waterfalls.setDepth(6);
    this.bgLayers.push(waterfalls);

    // Layer 5: Mid Jungle Canopy
    const midJungle = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_mid_jungle');
    midJungle.setScrollFactor(GAME_CONFIG.PARALLAX.MID_JUNGLE);
    midJungle.setDepth(9);
    this.bgLayers.push(midJungle);

    // Layer 6: Foreground Jungle Vines (zooms in front of camera)
    this.foregroundLayer = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_foreground_jungle');
    this.foregroundLayer.setScrollFactor(GAME_CONFIG.PARALLAX.FOREGROUND_VINES);
    this.foregroundLayer.setDepth(50);
  }

  private setupPhysicsColliders() {
    // Ground collider: platforms zones vs character
    const platforms = this.levelGenerator.getPlatforms();
    platforms.forEach(p => {
      this.physics.add.collider(this.character, p.staticCollider, () => {
        if (this.character.getState() === 'JUMPING') {
          this.character.onLanded();
          this.atmosphereSystem.spawnDustPuff(this.character.x, this.character.y + 60, 5);
        }
      });

      // Gate collision zone
      if (p.gate) {
        this.physics.add.overlap(this.character, p.gate.colliderZone, () => {
          if (!p.gate?.getIsOpen()) {
            this.handlePlayerCrashedIntoGate();
          }
        });
      }

      // Coin collection overlap
      p.coins.forEach(coin => {
        this.physics.add.overlap(this.character, coin, () => {
          this.handleCoinCollected(coin);
        });
      });
    });
  }

  private setupKeyboardInput() {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (!this.isGameActive || this.isGameOver) return;
      this.handleTypingInput(event.key);
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
    this.score += 200 + comboBonus;

    // Lower the active platform's gate!
    const activeGate = this.levelGenerator.getActiveGate();
    if (activeGate) {
      activeGate.openGate((x, y) => {
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

  private handleCoinCollected(coin: Phaser.Physics.Arcade.Sprite) {
    if (this.isGameOver) return;
    const collected = (coin as unknown as { collect: () => boolean }).collect();
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

    // 3. Dynamic speed scaling based on WPM
    const currentWPM = this.wordManager.getSmoothedWPM();
    const dynamicSpeed = GAME_CONFIG.PLAYER.BASE_SPEED + Math.min(100, (currentWPM - 20) * 1.4);
    this.character.setSpeed(dynamicSpeed);

    // 4. Update character movement & footstep particles
    this.character.updateMovement(delta, (x, y) => {
      this.atmosphereSystem.spawnDustPuff(x, y, 2);
    });

    // 5. Update procedural level platforms ahead & cleanup behind
    this.levelGenerator.update(camScrollX, dynamicSpeed);

    // Attach colliders for newly generated platforms
    this.setupPhysicsColliders();

    // 6. Check Jump Takeoff Threshold near platform edge!
    const activePlatform = this.levelGenerator.getActivePlatformForX(this.character.x);
    if (activePlatform) {
      // If gate on this platform has been opened and character is near edge -> TRIGGER JUMP!
      if (this.isWordClearedForCurrentPlatform) {
        if (JumpPhysics.isAtTakeoffPoint(this.character.x, activePlatform.rightX)) {
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
    this.score = currentDistance * 2 + this.coinsCount * 100 + (this.wordManager.getStats().totalWordsCompleted * 200);

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
    const activeGate = this.levelGenerator.getActiveGate();
    if (activeGate) {
      activeGate.updateWordDisplay(word, typed, isError);
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
    const elapsedSeconds = Math.max(1, Math.round((performance.now() - this.gameStartTime) / 1000));

    return {
      score: this.score,
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

  public pauseGame() {
    this.isGameActive = false;
    this.physics.pause();
    this.character.anims.pause();
  }

  public resumeGame() {
    this.isGameActive = true;
    this.physics.resume();
    this.character.anims.resume();
  }

  public restartGame() {
    this.scene.restart();
  }
}
