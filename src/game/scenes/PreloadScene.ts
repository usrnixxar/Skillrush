import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  public preload() {
    this.createLoadingUI();

    // 1. Character Spritesheets
    this.load.spritesheet('char_run_sheet', '/assets/character/run_spritesheet.png', {
      frameWidth: GAME_CONFIG.PLAYER.FRAME_WIDTH,
      frameHeight: GAME_CONFIG.PLAYER.FRAME_HEIGHT,
    });
    this.load.spritesheet('char_jump_sheet', '/assets/character/jump_spritesheet.png', {
      frameWidth: GAME_CONFIG.PLAYER.FRAME_WIDTH,
      frameHeight: GAME_CONFIG.PLAYER.FRAME_HEIGHT,
    });
    this.load.spritesheet('char_idle_sheet', '/assets/character/idle_spritesheet.png', {
      frameWidth: GAME_CONFIG.PLAYER.FRAME_WIDTH,
      frameHeight: GAME_CONFIG.PLAYER.FRAME_HEIGHT,
    });
    this.load.spritesheet('char_fall_sheet', '/assets/character/fall_spritesheet.png', {
      frameWidth: GAME_CONFIG.PLAYER.FRAME_WIDTH,
      frameHeight: GAME_CONFIG.PLAYER.FRAME_HEIGHT,
    });
    this.load.spritesheet('char_hit_sheet', '/assets/character/hit_spritesheet.png', {
      frameWidth: GAME_CONFIG.PLAYER.FRAME_WIDTH,
      frameHeight: GAME_CONFIG.PLAYER.FRAME_HEIGHT,
    });

    // 2. Background Parallax Layers
    this.load.image('bg_sky', '/assets/backgrounds/01_sky.png');
    this.load.image('bg_mountains', '/assets/backgrounds/02_mountains.png');
    this.load.image('bg_temple', '/assets/backgrounds/03_temple_ruins.png');
    this.load.image('bg_waterfalls', '/assets/backgrounds/04_waterfalls.png');
    this.load.image('bg_mid_jungle', '/assets/backgrounds/05_mid_jungle.png');
    this.load.image('bg_foreground_jungle', '/assets/backgrounds/06_foreground_jungle.png');

    // 3. Terrain & Platforms
    this.load.image('stone_floor', '/assets/terrain/stone_floor_256x128.png');
    this.load.image('mossy_floor', '/assets/terrain/mossy_floor_256x128.png');
    this.load.image('broken_floor', '/assets/terrain/broken_floor_256x128.png');
    this.load.image('stone_edge', '/assets/terrain/stone_edge_256x128.png');
    this.load.image('rope_bridge', '/assets/terrain/rope_bridge_640x200.png');

    // 4. Obstacles & Gate frames
    for (let i = 0; i < 12; i++) {
      const idx = i.toString().padStart(2, '0');
      this.load.image(`gate_${idx}`, `/assets/obstacles/gate_${idx}.png`);
    }
    this.load.image('stone_pillar', '/assets/obstacles/stone_pillar.png');
    this.load.image('spikes', '/assets/obstacles/spikes.png');
    this.load.image('log', '/assets/obstacles/log.png');

    // 5. Coins
    for (let i = 0; i < 12; i++) {
      const idx = i.toString().padStart(2, '0');
      this.load.image(`coin_${idx}`, `/assets/collectibles/coins/coin_${idx}.png`);
    }

    // 6. Effects
    for (let i = 0; i < 10; i++) {
      const idx = i.toString().padStart(2, '0');
      this.load.image(`dust_${idx}`, `/assets/effects/dust_${idx}.png`);
      this.load.image(`gate_debris_${idx}`, `/assets/effects/gate_debris_${idx}.png`);
      this.load.image(`sparkle_${idx}`, `/assets/effects/sparkle_${idx}.png`);
    }

    // 7. UI
    this.load.image('hud_panel', '/assets/ui/hud_panel.png');
    this.load.image('button_play', '/assets/ui/button_play.png');
    this.load.image('button_pause', '/assets/ui/button_pause.png');
    this.load.image('button_restart', '/assets/ui/button_restart.png');
    this.load.image('button_leaderboard', '/assets/ui/button_leaderboard.png');
  }

  public create() {
    this.registerAnimations();
    this.scene.start('MainGameScene');
  }

  private createLoadingUI() {
    const { width, height } = this.cameras.main;

    // Dark temple background
    const bg = this.add.graphics();
    bg.fillStyle(0x080f0a, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    const title = this.add.text(width / 2, height / 2 - 60, 'SKILLENCE TYPE RUNNER', {
      fontFamily: 'Cinzel, serif',
      fontSize: '34px',
      color: '#f59e0b',
      fontStyle: 'bold',
      letterSpacing: 3,
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(width / 2, height / 2 - 15, 'Entering Ancient Temple Grounds...', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '17px',
      color: '#94a3b8',
    });
    subtitle.setOrigin(0.5);

    // Progress Bar Background
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x132017, 0.9);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 + 30, 320, 20, 10);
    progressBox.lineStyle(2, 0xd97706, 0.7);
    progressBox.strokeRoundedRect(width / 2 - 160, height / 2 + 30, 320, 20, 10);

    const progressBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xf59e0b, 1);
      progressBar.fillRoundedRect(width / 2 - 156, height / 2 + 34, 312 * value, 12, 6);
    });
  }

  private registerAnimations() {
    // 1. Character Animations
    this.anims.create({
      key: 'anim_character_run',
      frames: this.anims.generateFrameNumbers('char_run_sheet', { start: 0, end: 11 }),
      frameRate: GAME_CONFIG.ANIMATION_FPS.RUN,
      repeat: -1,
    });

    this.anims.create({
      key: 'anim_character_jump',
      frames: this.anims.generateFrameNumbers('char_jump_sheet', { start: 0, end: 9 }),
      frameRate: GAME_CONFIG.ANIMATION_FPS.JUMP,
      repeat: 0,
    });

    this.anims.create({
      key: 'anim_character_idle',
      frames: this.anims.generateFrameNumbers('char_idle_sheet', { start: 0, end: 7 }),
      frameRate: GAME_CONFIG.ANIMATION_FPS.IDLE,
      repeat: -1,
    });

    this.anims.create({
      key: 'anim_character_fall',
      frames: this.anims.generateFrameNumbers('char_fall_sheet', { start: 0, end: 7 }),
      frameRate: GAME_CONFIG.ANIMATION_FPS.FALL,
      repeat: 0,
    });

    this.anims.create({
      key: 'anim_character_hit',
      frames: this.anims.generateFrameNumbers('char_hit_sheet', { start: 0, end: 5 }),
      frameRate: GAME_CONFIG.ANIMATION_FPS.HIT,
      repeat: 0,
    });

    // 2. Temple Gate Lowering Animation
    const gateFrames = [];
    for (let i = 0; i < 12; i++) {
      gateFrames.push({ key: `gate_${i.toString().padStart(2, '0')}` });
    }
    this.anims.create({
      key: 'anim_gate_open',
      frames: gateFrames,
      frameRate: GAME_CONFIG.ANIMATION_FPS.GATE,
      repeat: 0,
    });

    // 3. Rotating Coin Animation
    const coinFrames = [];
    for (let i = 0; i < 12; i++) {
      coinFrames.push({ key: `coin_${i.toString().padStart(2, '0')}` });
    }
    this.anims.create({
      key: 'anim_coin_spin',
      frames: coinFrames,
      frameRate: GAME_CONFIG.ANIMATION_FPS.COIN,
      repeat: -1,
    });
  }
}
