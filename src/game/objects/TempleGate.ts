import Phaser from 'phaser';
import { audioManager } from '../systems/AudioManager';

export class TempleGate extends Phaser.GameObjects.Container {
  public gateSprite: Phaser.GameObjects.Sprite;
  public leftPillar: Phaser.GameObjects.Sprite;
  public rightPillar: Phaser.GameObjects.Sprite;
  public colliderZone: Phaser.GameObjects.Rectangle;

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

    // Left and Right Stone Pillars with decorative shading
    this.leftPillar = scene.add.sprite(-85, -20, 'stone_pillar');
    this.leftPillar.setDisplaySize(42, 230);
    this.leftPillar.setDepth(14);
    this.add(this.leftPillar);

    this.rightPillar = scene.add.sprite(85, -20, 'stone_pillar');
    this.rightPillar.setDisplaySize(42, 230);
    this.rightPillar.setDepth(14);
    this.add(this.rightPillar);

    // Main Gate Sprite
    this.gateSprite = scene.add.sprite(0, 0, 'real_props', 'gate');
    this.gateSprite.setDisplaySize(215, 255);
    this.leftPillar.setVisible(false);
    this.rightPillar.setVisible(false);
    this.add(this.gateSprite);

    // Solid Physics Collider Rectangle
    this.colliderZone = scene.add.rectangle(x, y + 20, 110, 210, 0x000000, 0);
    scene.physics.add.existing(this.colliderZone, true); // Static body

    // Floating Ancient Stone Banner above Gate
    this.wordBannerContainer = scene.add.container(0, -160);

    this.bannerBg = scene.add.graphics();
    this.wordBannerContainer.add(this.bannerBg);

    this.wordText = scene.add.text(0, 0, word, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '28px',
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

  public updateWordDisplay(targetWord: string, _typed: string, isError: boolean) {
    this.word = targetWord;

    const textWidth = Math.max(150, targetWord.length * 24 + 44);
    const textHeight = 48;

    this.bannerBg.clear();
    // Shadow
    this.bannerBg.fillStyle(0x040805, 0.85);
    this.bannerBg.fillRoundedRect(-textWidth / 2 + 3, -textHeight / 2 + 4, textWidth, textHeight, 10);

    // Ancient stone body
    this.bannerBg.fillStyle(0x18241a, 0.96);
    this.bannerBg.fillRoundedRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 10);

    // Inlaid gold / red border
    this.bannerBg.lineStyle(2.5, isError ? 0xef4444 : 0xd97706, 0.95);
    this.bannerBg.strokeRoundedRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 10);

    this.wordText.setText(targetWord);
  }

  /**
   * Triggers the wall collapse into stone pieces and sinks into ground
   */
  public collapseAndOpen(onDebrisSpawn?: (x: number, y: number) => void) {
    if (this.isLowering || this.isPassable) return;
    this.isLowering = true;
    this.isPassable = true;

    // Immediately disable collider so runner never hits a solved wall
    if (this.colliderZone && this.colliderZone.body) {
      (this.colliderZone.body as Phaser.Physics.Arcade.StaticBody).enable = false;
    }

    // Play wall destruction sound
    audioManager.playWallDestruction();

    // Spawn massive tumbling stone pieces and dust
    if (onDebrisSpawn) {
      onDebrisSpawn(this.x, this.y + 60);
    }

    // Shake gate before collapse
    this.scene.tweens.add({
      targets: this.gateSprite,
      x: '+=6',
      duration: 35,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        // Play gate collapse frames
        // Preserve the realistic stone texture throughout the collapse.

        // Shatter gate downward with crumbling rotation
        this.scene.tweens.add({
          targets: this.gateSprite,
          y: '+=110',
          scaleY: this.gateSprite.scaleY * 0.2,
          alpha: 0,
          duration: 380,
          ease: 'Cubic.easeIn',
        });

        // Dissolve banner with golden flash
        this.scene.tweens.add({
          targets: this.wordBannerContainer,
          y: '-=30',
          alpha: 0,
          scale: 1.2,
          duration: 300,
          ease: 'Back.easeOut',
        });
      },
    });
  }

  public destroy(fromScene?: boolean) {
    if (this.colliderZone) {
      this.colliderZone.destroy();
    }
    super.destroy(fromScene);
  }
}
