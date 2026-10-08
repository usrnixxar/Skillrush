import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { TempleGate } from './TempleGate';
import { Coin } from './Coin';

export type PlatformType = 'TEMPLE_STONE' | 'ROPE_BRIDGE';

export class Platform extends Phaser.GameObjects.Container {
  public leftX: number;
  public rightX: number;
  public length: number;
  public floorY: number;
  public platformType: PlatformType;

  public staticCollider: Phaser.GameObjects.Rectangle;
  public gate: TempleGate | null = null;
  public coins: Coin[] = [];

  constructor(
    scene: Phaser.Scene,
    startX: number,
    length: number,
    floorY: number = GAME_CONFIG.WORLD.FLOOR_Y,
    platformType: PlatformType = 'TEMPLE_STONE'
  ) {
    super(scene, startX, floorY);

    this.leftX = startX;
    this.length = length;
    this.rightX = startX + length;
    this.floorY = floorY;
    this.platformType = platformType;

    this.setDepth(10);

    // Build the visual tiles for this platform
    this.constructVisuals(scene);

    // Create a solid static physics rectangle for reliable footing
    // Top surface aligns exactly at floorY
    this.staticCollider = scene.add.rectangle(startX + length / 2, floorY + 16, length, 32, 0x000000, 0);
    scene.physics.add.existing(this.staticCollider, true); // Static arcade body

    const body = this.staticCollider.body as Phaser.Physics.Arcade.StaticBody;
    if (body) {
      body.checkCollision.down = false;
      body.checkCollision.left = false;
      body.checkCollision.right = false;
      body.checkCollision.up = true; // Top-solid surface
    }

    scene.add.existing(this);
  }

  private constructVisuals(scene: Phaser.Scene) {
    if (this.platformType === 'ROPE_BRIDGE') {
      this.constructRopeBridge(scene);
    } else {
      this.constructTempleStone(scene);
    }
  }

  private constructTempleStone(scene: Phaser.Scene) {
    const tileWidth = 256;
    const tileHeight = 128;
    const numTiles = Math.ceil(this.length / tileWidth);

    // 1. Cliff Foundation below the roadway: realistic rocky stratified cliff
    const cliffGraphics = scene.add.graphics();
    // Deep canyon bedrock
    cliffGraphics.fillStyle(0x0a140d, 0.98);
    cliffGraphics.fillRect(0, tileHeight - 12, this.length, 320);

    // Stratified rocky layers & moss wash
    cliffGraphics.fillStyle(0x132217, 0.85);
    cliffGraphics.fillRect(0, tileHeight - 8, this.length, 45);

    // Creeping moss & stone edge highlights
    cliffGraphics.fillStyle(0x27402c, 0.7);
    for (let x = 15; x < this.length; x += 60) {
      cliffGraphics.fillRoundedRect(x, tileHeight - 10, 40, 16, 4);
    }

    // Rocky vertical crevices & cliff cracks
    cliffGraphics.lineStyle(2, 0x050a06, 0.9);
    for (let x = 45; x < this.length; x += 85) {
      cliffGraphics.beginPath();
      cliffGraphics.moveTo(x, tileHeight - 10);
      cliffGraphics.lineTo(x + 12, tileHeight + 80);
      cliffGraphics.lineTo(x + 8, tileHeight + 220);
      cliffGraphics.strokePath();
    }

    this.add(cliffGraphics);

    // 2. Tiled modular stone surface
    for (let i = 0; i < numTiles; i++) {
      const tileX = i * tileWidth;
      let textureKey = 'stone_floor';

      // Varied ancient mossy / broken floor textures
      if (i === 0 || i === numTiles - 1) {
        textureKey = 'stone_edge';
      } else if (i % 3 === 1) {
        textureKey = 'mossy_floor';
      } else if (i % 4 === 2) {
        textureKey = 'broken_floor';
      }

      const tileSprite = scene.add.sprite(tileX, 0, textureKey);
      tileSprite.setOrigin(0, 0);
      tileSprite.setDisplaySize(tileWidth, tileHeight);

      // Flip edge tile on the right side
      if (i === numTiles - 1) {
        tileSprite.setFlipX(true);
      }

      this.add(tileSprite);
    }

    // 3. Ancient roadway surface shadow & torchlight accents
    const shadowGraphics = scene.add.graphics();
    shadowGraphics.fillStyle(0x000000, 0.35);
    shadowGraphics.fillRect(0, 0, this.length, 8);
    this.add(shadowGraphics);
  }

  private constructRopeBridge(scene: Phaser.Scene) {
    const bridgeWidth = 640;
    const bridgeHeight = 200;
    const numSegments = Math.ceil(this.length / bridgeWidth);

    for (let i = 0; i < numSegments; i++) {
      const sprite = scene.add.sprite(i * bridgeWidth, -25, 'rope_bridge');
      sprite.setOrigin(0, 0);
      sprite.setDisplaySize(bridgeWidth, bridgeHeight);
      this.add(sprite);
    }
  }

  public setGate(gate: TempleGate) {
    this.gate = gate;
  }

  public addCoin(coin: Coin) {
    this.coins.push(coin);
  }

  public destroy(fromScene?: boolean) {
    if (this.staticCollider) {
      this.staticCollider.destroy();
    }
    if (this.gate) {
      this.gate.destroy();
      this.gate = null;
    }
    this.coins.forEach(c => {
      if (c && c.active) c.destroy();
    });
    this.coins = [];

    super.destroy(fromScene);
  }
}
