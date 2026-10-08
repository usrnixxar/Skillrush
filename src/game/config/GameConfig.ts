export const GAME_CONFIG = {
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  ASPECT_RATIO: 16 / 9,

  PHYSICS: {
    GRAVITY_Y: 1150,
  },

  PLAYER: {
    START_X: 280,
    BASE_SPEED: 220, // Pixels per second
    MAX_SPEED: 340,
    JUMP_VELOCITY_Y: -620, // Upward impulse
    FRAME_WIDTH: 140,
    FRAME_HEIGHT: 180,
    BODY_WIDTH: 52,
    BODY_HEIGHT: 124,
    OFFSET_X: 44,
    OFFSET_Y: 40,
  },

  WORLD: {
    FLOOR_Y: 570,
    PLATFORM_HEIGHT: 128,
    MIN_GAP: 160,
    MAX_GAP: 320,
    REACTION_BUFFER_SECONDS: 1.6, // Generous starter buffer
    MIN_ROAD_LENGTH: 450,
    MAX_ROAD_LENGTH: 1400,
    INITIAL_ROAD_LENGTH: 750,
  },

  WPM: {
    INITIAL_WPM: 25,
    MIN_WPM: 15,
    MAX_WPM: 130,
    SMOOTHING_WINDOW: 7, // Number of words to average
  },

  ANIMATION_FPS: {
    RUN: 30,
    JUMP: 16,
    IDLE: 8,
    FALL: 8,
    HIT: 6,
    GATE: 14,
    COIN: 12,
    DUST: 12,
    SPARKLE: 12,
    GATE_DEBRIS: 12,
  },

  PARALLAX: {
    SKY: 0.0,
    MOUNTAINS: 0.08,
    TEMPLES: 0.18,
    WATERFALLS: 0.28,
    MID_JUNGLE: 0.48,
    ROAD: 1.0,
    FOREGROUND_VINES: 1.25,
  },
};
