import { GAME_CONFIG } from '../config/GameConfig';

export class JumpPhysics {
  /**
   * Calculates maximum reachable horizontal jump distance for given speed
   */
  public static getMaxJumpDistance(horizontalSpeed: number): number {
    const vy = Math.abs(GAME_CONFIG.PLAYER.JUMP_VELOCITY_Y);
    const g = GAME_CONFIG.PHYSICS.GRAVITY_Y;
    const flightTime = (2 * vy) / g;
    return horizontalSpeed * flightTime;
  }

  /**
   * Calculates a safe gap width guaranteed to be comfortably cleared by the character
   */
  public static getSafeGapWidth(horizontalSpeed: number): number {
    const maxDist = this.getMaxJumpDistance(horizontalSpeed);
    // 65% to 75% of maximum reach ensures safe landing comfortably inside platform
    const safeGap = Math.round(maxDist * 0.70);
    return Math.min(
      GAME_CONFIG.WORLD.MAX_GAP,
      Math.max(GAME_CONFIG.WORLD.MIN_GAP, safeGap)
    );
  }

  /**
   * Checks if character is at or past the takeoff point near the platform edge
   */
  public static isAtTakeoffPoint(characterX: number, platformRightEdge: number): boolean {
    const takeoffMargin = 40; // Pixels before edge
    return characterX >= (platformRightEdge - takeoffMargin);
  }
}
