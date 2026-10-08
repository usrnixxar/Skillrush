import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { Platform } from '../objects/Platform';
import { TempleGate } from '../objects/TempleGate';
import { Coin } from '../objects/Coin';
import { JumpPhysics } from './JumpPhysics';
import { WordManager } from './WordManager';

export class LevelGenerator {
  private scene: Phaser.Scene;
  private wordManager: WordManager;
  private platforms: Platform[] = [];
  private nextStartX = 0;
  private platformCounter = 0;

  // Static physics groups for clean 60 FPS performance without duplicate colliders
  public platformColliderGroup!: Phaser.Physics.Arcade.StaticGroup;
  public gateZoneGroup!: Phaser.Physics.Arcade.StaticGroup;
  public coinGroup!: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene, wordManager: WordManager) {
    this.scene = scene;
    this.wordManager = wordManager;
  }

  public init(
    platformGroup: Phaser.Physics.Arcade.StaticGroup,
    gateGroup: Phaser.Physics.Arcade.StaticGroup,
    coinGroup: Phaser.Physics.Arcade.StaticGroup
  ) {
    this.platformColliderGroup = platformGroup;
    this.gateZoneGroup = gateGroup;
    this.coinGroup = coinGroup;

    // Clean up any existing platforms
    this.platforms.forEach(p => p.destroy());
    this.platforms = [];
    this.nextStartX = 50;
    this.platformCounter = 0;

    // Platform 0: Starter road
    const starterWord = this.wordManager.getCurrentWord();
    const starterLength = 850;
    this.generatePlatform(this.nextStartX, starterLength, starterWord, false);

    // Generate upcoming 3 platforms ahead
    for (let i = 0; i < 3; i++) {
      this.generateNextPlatform(GAME_CONFIG.PLAYER.BASE_SPEED);
    }
  }

  public getPlatforms(): Platform[] {
    return this.platforms;
  }

  public getActivePlatformForX(x: number): Platform | undefined {
    return this.platforms.find(p => x >= p.leftX - 40 && x <= p.rightX + 50);
  }

  /**
   * Returns the next unopened gate directly in front of the player
   */
  public getNextGateAhead(characterX: number): TempleGate | null {
    for (const p of this.platforms) {
      if (p.gate && !p.gate.getIsOpen() && p.gate.x > characterX - 60) {
        return p.gate;
      }
    }
    return null;
  }

  public update(cameraScrollX: number, playerSpeed: number) {
    // 1. Generate more platforms if needed ahead
    const generationHorizon = cameraScrollX + 2400;
    while (this.nextStartX < generationHorizon) {
      this.generateNextPlatform(playerSpeed);
    }

    // 2. Recycle platforms that are far behind camera
    const cleanupHorizon = cameraScrollX - 700;
    this.platforms = this.platforms.filter(p => {
      if (p.rightX < cleanupHorizon) {
        // Remove bodies from physics groups
        if (p.staticCollider && this.platformColliderGroup) {
          this.platformColliderGroup.remove(p.staticCollider, true, true);
        }
        if (p.gate && this.gateZoneGroup) {
          this.gateZoneGroup.remove(p.gate.colliderZone, true, true);
        }
        p.coins.forEach(c => {
          if (c && c.active && this.coinGroup) {
            this.coinGroup.remove(c, true, true);
          }
        });
        p.destroy();
        return false;
      }
      return true;
    });
  }

  private generateNextPlatform(playerSpeed: number) {
    this.platformCounter++;

    // Safe gap between previous platform and this new one
    const gap = JumpPhysics.getSafeGapWidth(playerSpeed);
    const startX = this.nextStartX + gap;

    // Pick target word for this specific platform
    const platformWord = this.wordManager.generateNextWord();
    const length = this.wordManager.calculateRoadLength(platformWord, playerSpeed);

    // 1 in 5 platforms can be a rope bridge if sufficiently wide
    const isRopeBridge = this.platformCounter % 5 === 0 && length >= 640;

    this.generatePlatform(startX, length, platformWord, isRopeBridge);
  }

  private generatePlatform(startX: number, length: number, word: string, isRopeBridge: boolean) {
    const platform = new Platform(
      this.scene,
      startX,
      length,
      GAME_CONFIG.WORLD.FLOOR_Y,
      isRopeBridge ? 'ROPE_BRIDGE' : 'TEMPLE_STONE'
    );

    // Add static platform collider to the group
    if (this.platformColliderGroup) {
      this.platformColliderGroup.add(platform.staticCollider);
    }

    // Place Temple Gate ~170px before the jump edge
    const gateX = startX + length - 170;
    const gateY = GAME_CONFIG.WORLD.FLOOR_Y - 95;
    const gate = new TempleGate(this.scene, gateX, gateY, word);
    platform.setGate(gate);

    if (this.gateZoneGroup) {
      this.gateZoneGroup.add(gate.colliderZone);
    }

    // Place Collectible Coins along the runway before the gate
    const coinStartX = startX + 160;
    const coinSpacing = 90;
    const availableCoinSpace = gateX - 120 - coinStartX;
    const numCoins = Math.min(5, Math.max(2, Math.floor(availableCoinSpace / coinSpacing)));

    for (let i = 0; i < numCoins; i++) {
      const cx = coinStartX + i * coinSpacing;
      const cy = GAME_CONFIG.WORLD.FLOOR_Y - 55;
      const coin = new Coin(this.scene, cx, cy);
      platform.addCoin(coin);

      if (this.coinGroup) {
        this.coinGroup.add(coin);
      }
    }

    this.platforms.push(platform);
    this.nextStartX = startX + length;
  }
}
