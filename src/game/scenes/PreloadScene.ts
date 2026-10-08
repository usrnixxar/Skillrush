import Phaser from 'phaser';
import { createRealisticTextures } from '../systems/RealisticAssets';
import { GAME_CONFIG } from '../config/GameConfig';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  public preload() {
    this.createLoadingUI();

    this.load.image('real_run', '/assets/realistic-v1/run-reference-48-v1.webp');
    // Single-pose fallback keeps the player visible if a frame atlas is delayed
    // or a browser has trouble decoding an animated WebP texture.
    this.load.image('real_explorer', '/assets/realistic-v1/explorer.webp');
    this.load.image('real_jump', '/assets/realistic-v1/jump-small.webp');
    this.load.image('real_jungle', '/assets/realistic-v1/jungle-small.webp');
    this.load.image('real_props', '/assets/realistic-v1/props-small.webp');

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

  }

  public create() {
    createRealisticTextures(this);
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
    const title = this.add.text(width / 2, height / 2 - 60, 'SKILLRUSH', {
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
    this.anims.create({key: 'anim_character_run',
      frames: Array.from({length:48},(_,i)=>({key:`explorer_run_${i}`})),
      frameRate: GAME_CONFIG.ANIMATION_FPS.RUN, repeat: -1});
    this.anims.create({key: 'anim_character_idle', frames:[{key:'explorer_run_1'}], frameRate:1});
    this.anims.create({key: 'anim_character_hit', frames:[{key:'explorer_jump_3'}], frameRate:1});
    this.anims.create({key: 'anim_character_fall', frames:[{key:'explorer_jump_2'}], frameRate:1});

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
