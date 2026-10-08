import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager';

export class TempleGate extends Phaser.GameObjects.Container {
  public gateSprite: Phaser.GameObjects.Sprite;
  public leftPillar: Phaser.GameObjects.Sprite;
  public rightPillar: Phaser.GameObjects.Sprite;
  public colliderZone: Phaser.GameObjects.Zone;

  private wordBannerContainer: Phaser.GameObjects.Container;
  private wordText: Phaser.GameObjects.Text;
  private bannerBg: Phaser.GameObjects.Graphics;

  private isLowering = false;
  private isPassable = false;
  private word: string;

  constructor(scene: Phaser.Scene, x: number, y: number, word: string) {
    super(scene, x, y);

    this.word = word;
    this.setDepth(15);

    // Left and Right Stone Pillars
    this.leftPillar = scene.add.sprite(-85, -20, 'stone_pillar');
    this.leftPillar.setDisplaySize(38, 220);
    this.leftPillar.setDepth(14);
    this.add(this.leftPillar);

    this.rightPillar = scene.add.sprite(85, -20, 'stone_pillar');
    this.rightPillar.setDisplaySize(38, 220);
    this.rightPillar.setDepth(14);
    this.add(this.rightPillar);

    // Main Gate Sprite (starts closed at gate_00)
    this.gateSprite = scene.add.sprite(0, 0, 'gate_00');
    this.gateSprite.setDisplaySize(180, 240);
    this.add(this.gateSprite);

    // Physics Collider Zone
    this.colliderZone = scene.add.zone(x, y + 20, 120, 200);
    scene.physics.add.existing(this.colliderZone, true); // Static body

    // Floating Ancient Stone Banner above Gate
    this.wordBannerContainer = scene.add.container(0, -155);

    this.bannerBg = scene.add.graphics();
    this.wordBannerContainer.add(this.bannerBg);

    this.wordText = scene.add.text(0, 0, word, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '26px',
      color: '#fef08a',
      fontStyle: 'bold',
      letterSpacing: 4,
    });
    this.wordText.setOrigin(0.5);
    this.wordBannerContainer.add(this.wordText);

    this.add(this.wordBannerContainer);
    this.updateWordDisplay(word, '', false);

    scene.add.existing(this);
  }

  public getTargetWord(): string {
    return this.word;
  }

  public getIsOpen(): boolean {
    return this.isPassable;
  }

  public updateWordDisplay(targetWord: string, typed: string, isError: boolean) {
    this.word = targetWord;

    // Draw stone banner background with carved border
    const textWidth = Math.max(140, targetWord.length * 22 + 40);
    const textHeight = 44;

    this.bannerBg.clear();
    // Shadow
    this.bannerBg.fillStyle(0x040805, 0.85);
    this.bannerBg.fillRoundedRect(-textWidth / 2 + 2, -textHeight / 2 + 3, textWidth, textHeight, 8);

    // Ancient stone body
    this.bannerBg.fillStyle(0x1a261c, 0.95);
    this.bannerBg.fillRoundedRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 8);

    // Inlaid gold border
    this.bannerBg.lineStyle(2, isError ? 0xef4444 : 0xd97706, 0.9);
    this.bannerBg.strokeRoundedRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 8);

    // Stylized letter rendering
    let displayHtml = '';
    // Let's format the word string with colored segments
    this.wordText.setText(targetWord);
  }

  /**
   * Triggers the gate lowering sequence, sinks into ground, and disables collision
   */
  public openGate(onDebrisSpawn?: (x: number, y: number) => void) {
    if (this.isLowering || this.isPassable) return;
    this.isLowering = true;

    audioManager.playGateOpen();

    if (onDebrisSpawn) {
      onDebrisSpawn(this.x, this.y + 70);
    }

    // Play gate lowering animation frames: gate_00 to gate_11
    this.gateSprite.play('anim_gate_open');

    this.gateSprite.on('animationcomplete', () => {
      this.isPassable = true;
      // Disable physics collider zone
      if (this.colliderZone.body) {
        (this.colliderZone.body as Phaser.Physics.Arcade.Body).enable = false;
      }

      // Smooth sink down into ground slot
      this.scene.tweens.add({
        targets: [this.gateSprite, this.wordBannerContainer],
        y: '+=50',
        alpha: 0,
        duration: 400,
        ease: 'Cubic.easeIn',
      });
    });
  }

  public destroy(fromScene?: boolean) {
    if (this.colliderZone) {
      this.colliderZone.destroy();
    }
    super.destroy(fromScene);
  }
}
