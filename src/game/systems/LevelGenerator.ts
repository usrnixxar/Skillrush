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
  private platformIndex = 0;

  constructor(scene: Phaser.Scene, wordManager: WordManager) {
    this.scene = scene;
    this.wordManager = wordManager;
  }

  public init() {
    this.platforms.forEach(p => p.destroy());
    this.platforms = [];
    this.nextStartX = 50;
    this.platformIndex = 0;

    // 1. Initial safe starter platform with first word
    const starterWord = this.wordManager.getCurrentWord();
    const starterLength = 800;
    this.generatePlatform(this.nextStartX, starterLength, starterWord, false);

    // 2. Generate 3 upcoming platforms ahead
    for (let i = 0; i < 3; i++) {
      this.generateNextPlatform(220);
    }
  }

  public getPlatforms(): Platform[] {
    return this.platforms;
  }

  public getActivePlatformForX(x: number): Platform | undefined {
    return this.platforms.find(p => x >= p.leftX - 30 && x <= p.rightX + 50);
  }

  public getActiveGate(): TempleGate | null {
    // Return the earliest un-cleared gate
    for (const p of this.platforms) {
      if (p.gate && !p.gate.getIsOpen()) {
        return p.gate;
      }
    }
    return null;
  }

  public update(cameraScrollX: number, playerSpeed: number) {
    // 1. Generate more platforms if needed ahead
    const generationHorizon = cameraScrollX + 2200;
    while (this.nextStartX < generationHorizon) {
      this.generateNextPlatform(playerSpeed);
    }

    // 2. Recycle platforms that are far behind camera
    const cleanupHorizon = cameraScrollX - 600;
    this.platforms = this.platforms.filter(p => {
      if (p.rightX < cleanupHorizon) {
        p.destroy();
        return false;
      }
      return true;
    });
  }

  private generateNextPlatform(playerSpeed: number) {
    this.platformIndex++;

    // Safe gap between previous platform and this new one
    const gap = JumpPhysics.getSafeGapWidth(playerSpeed);
    const startX = this.nextStartX + gap;

    // Pick target word and calculate dynamic road length
    const nextWord = this.wordManager.advanceToNextWord();
    const length = this.wordManager.calculateRoadLength(nextWord, playerSpeed);

    // 1 in 5 platforms can be a rope bridge if sufficiently wide
    const isRopeBridge = this.platformIndex % 5 === 0 && length >= 640;

    this.generatePlatform(startX, length, nextWord, isRopeBridge);
  }

  private generatePlatform(startX: number, length: number, word: string, isRopeBridge: boolean) {
    const platform = new Platform(
      this.scene,
      startX,
      length,
      GAME_CONFIG.WORLD.FLOOR_Y,
      isRopeBridge ? 'ROPE_BRIDGE' : 'TEMPLE_STONE'
    );

    // Place Temple Gate ~170px before the jump edge
    const gateX = startX + length - 170;
    const gateY = GAME_CONFIG.WORLD.FLOOR_Y - 95;
    const gate = new TempleGate(this.scene, gateX, gateY, word);
    platform.setGate(gate);

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
    }

    this.platforms.push(platform);
    this.nextStartX = startX + length;
  }
}
