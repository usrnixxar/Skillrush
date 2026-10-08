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

  public staticCollider: Phaser.GameObjects.Zone;
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

    // Create a precise static physics zone for character footing
    this.staticCollider = scene.add.zone(startX + length / 2, floorY + 20, length, 40);
    scene.physics.add.existing(this.staticCollider, true); // Static body

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

    // 1. Cliff Foundation below the roadway
    const cliffGraphics = scene.add.graphics();
    cliffGraphics.fillStyle(0x0a140d, 0.95);
    cliffGraphics.fillRect(0, tileHeight - 10, this.length, 240);
    // Dark depth lines
    cliffGraphics.lineStyle(2, 0x050a06, 0.8);
    for (let x = 40; x < this.length; x += 90) {
      cliffGraphics.lineBetween(x, tileHeight - 10, x + 20, tileHeight + 200);
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

    // 3. Subtle ancient pathway shadow along top edge
    const shadowGraphics = scene.add.graphics();
    shadowGraphics.fillStyle(0x000000, 0.25);
    shadowGraphics.fillRect(0, 0, this.length, 6);
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
