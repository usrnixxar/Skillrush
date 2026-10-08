import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig';
import { audioManager } from '../systems/AudioManager';

export type CharacterState = 'IDLE' | 'RUNNING' | 'JUMPING' | 'FALLING' | 'HIT' | 'DEAD';

export class Character extends Phaser.Physics.Arcade.Sprite {
  private characterState: CharacterState = 'IDLE';
  private runSpeed: number = GAME_CONFIG.PLAYER.BASE_SPEED;
  private footstepTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'char_run_sheet', 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics body setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(GAME_CONFIG.PLAYER.BODY_WIDTH, GAME_CONFIG.PLAYER.BODY_HEIGHT);
    body.setOffset(GAME_CONFIG.PLAYER.OFFSET_X, GAME_CONFIG.PLAYER.OFFSET_Y);
    body.setCollideWorldBounds(false);

    this.setDepth(20);
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
    this.play('anim_character_jump', true);
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

    if (this.characterState === 'RUNNING') {
      this.setVelocityX(this.runSpeed);

      // Footstep sound & dust interval
      this.footstepTimer += delta;
      if (this.footstepTimer > 250) {
        this.footstepTimer = 0;
        audioManager.playFootstep();
        onFootstepDust(this.x - 15, this.y + 60);
      }
    } else if (this.characterState === 'JUMPING') {
      this.setVelocityX(this.runSpeed);

      if (body.velocity.y > 0 && this.anims.currentAnim?.key !== 'anim_character_jump') {
        this.play('anim_character_jump', true);
      }
    } else if (this.characterState === 'FALLING') {
      this.setVelocityX(this.runSpeed * 0.35);
    }
  }
}
