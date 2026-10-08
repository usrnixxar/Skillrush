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
    const face = scene.add.tileSprite(0,0,this.length,260,'real_stone_tile').setOrigin(0,0);
    this.add(face);
    const top = scene.add.rectangle(0,0,this.length,7,0xc7bd91,0.66).setOrigin(0,0);
    const lip = scene.add.rectangle(0,7,this.length,10,0x112016,0.56).setOrigin(0,0);
    this.add([top,lip]);
    // Plants sit behind the runner; keep takeoff and landing edges readable.
    for (let x=110;x<this.length-210;x+=310) {
      const plant = scene.add.image(x,4,'real_props',Math.floor(x/310)%2?'palm':'fern')
        .setOrigin(0.5,1).setDisplaySize(95,82).setAlpha(0.94);
      this.add(plant);
      scene.tweens.add({targets:plant,angle:{from:-1.5,to:1.5},duration:2200+x%500,
        yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    }
  }

  private constructRopeBridge(scene: Phaser.Scene) {
    // The same stone finish keeps every collision surface visually consistent.
    this.constructTempleStone(scene);
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
