import Phaser from 'phaser';

export class Coin extends Phaser.Physics.Arcade.Sprite {
  private floatTween: Phaser.Tweens.Tween | null = null;
  private isCollected = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'coin_00');

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body

    this.setDepth(18);
    this.setDisplaySize(48, 48);

    // Play rotating coin animation
    this.play('anim_coin_spin');

    // Subtle gentle float oscillation
    this.floatTween = scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 1000 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public collect(): boolean {
    if (this.isCollected) return false;
    this.isCollected = true;

    if (this.floatTween) {
      this.floatTween.stop();
    }

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = false;
    }

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });

    return true;
  }
}
