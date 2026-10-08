import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { audioManager } from '../systems/AudioManager';

export type CharacterState = 'IDLE' | 'RUNNING' | 'JUMPING' | 'FALLING' | 'HIT' | 'DEAD';

export class Character extends Phaser.Physics.Arcade.Sprite {
  private characterState: CharacterState = 'IDLE';
  private runSpeed: number = GAME_CONFIG.PLAYER.BASE_SPEED;
  private footstepTimer = 0;
  private groundShadow: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'explorer_run_0');

    this.groundShadow = scene.add.ellipse(x, GAME_CONFIG.WORLD.FLOOR_Y + 2, 66, 10, 0x05120c, 0.32).setDepth(19);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics body setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(GAME_CONFIG.PLAYER.BODY_WIDTH, GAME_CONFIG.PLAYER.BODY_HEIGHT);
    body.setOffset(GAME_CONFIG.PLAYER.OFFSET_X, GAME_CONFIG.PLAYER.OFFSET_Y);
    body.setCollideWorldBounds(false);

    this.setDepth(20);
    // Explicitly reset render state so a recycled sprite can never remain hidden.
    this.setVisible(true).setAlpha(1).setTint(0xffffff);
    if (!scene.textures.exists('explorer_run_0')) {
      this.setTexture('explorer_fallback');
    }
    this.play('anim_character_idle');
  }

  public getState(): CharacterState {
    return this.characterState;
  }

  public getSpeed(): number {
    return this.runSpeed;
  }

  public setSpeed(speed: number) {
    this.runSpeed = Math.min(GAME_CONFIG.PLAYER.MAX_SPEED, Math.max(GAME_CONFIG.PLAYER.BASE_SPEED, speed));
    if (this.characterState === 'RUNNING') {
      this.setVelocityX(this.runSpeed);
    }
  }

  public startRunning() {
    this.characterState = 'RUNNING';
    this.setVelocityX(this.runSpeed);
    this.play('anim_character_run', true);
  }

  public performJump() {
    if (this.characterState !== 'RUNNING') return;

    this.characterState = 'JUMPING';
    this.setVelocityY(GAME_CONFIG.PLAYER.JUMP_VELOCITY_Y);
    this.anims.stop();
    this.setTexture('explorer_jump_0');
    audioManager.playJump();
  }

  public onLanded() {
    if (this.characterState === 'JUMPING') {
      this.characterState = 'RUNNING';
      this.setVelocityX(this.runSpeed);
      this.play('anim_character_run', true);
      audioManager.playLanding();
    }
  }

  public triggerCollision() {
    this.characterState = 'HIT';
    this.setVelocity(0, 0);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setVelocity(0, 0);
    }
    this.play('anim_character_hit', true);
    audioManager.playCollision();
  }

  public triggerFall() {
    if (this.characterState !== 'FALLING' && this.characterState !== 'DEAD') {
      this.characterState = 'FALLING';
      this.play('anim_character_fall', true);
    }
  }

  public updateMovement(delta: number, onFootstepDust: (x: number, y: number) => void) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
    if (!this.visible || this.alpha <= 0) this.setVisible(true).setAlpha(1);
    this.groundShadow.setPosition(this.x, GAME_CONFIG.WORLD.FLOOR_Y + 2);
    this.groundShadow.setVisible(body.blocked.down && this.characterState !== 'FALLING');
    this.anims.timeScale = Math.min(1.35, Math.max(1, this.runSpeed / GAME_CONFIG.PLAYER.BASE_SPEED));

    if (this.characterState === 'RUNNING') {
      this.setVelocityX(this.runSpeed);

      // Footstep sound & dust interval
      this.footstepTimer += delta;
      if (this.footstepTimer > 250) {
        this.footstepTimer = 0;
        audioManager.playFootstep();
        onFootstepDust(this.x - 8, body.bottom - 2);
      }
    } else if (this.characterState === 'JUMPING') {
      this.setVelocityX(this.runSpeed);

      const pose = body.velocity.y < -260 ? 0 : body.velocity.y < 160 ? 1 : 2;
      this.setTexture(`explorer_jump_${pose}`);
    } else if (this.characterState === 'FALLING') {
      this.setVelocityX(this.runSpeed * 0.35);
    }
  }
}
