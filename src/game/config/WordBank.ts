export const WORD_BANK = {
  // 3-4 letter words (Beginner / quick gates)
  SHORT: [
    'RUN', 'JUMP', 'GOLD', 'VINE', 'RUIN', 'MOSS', 'GATE', 'CAVE', 'PATH', 'STEP',
    'DASH', 'LEAP', 'TOMB', 'WALL', 'MIST', 'TREE', 'RUSH', 'WIND', 'FIRE', 'SOIL',
    'WILD', 'ROPE', 'CLIMB', 'EDGE', 'DROP', 'LAKE', 'ROCK', 'IDOL', 'ARCH', 'PEAK'
  ],

  // 5-6 letter words (Core Temple Adventure)
  MEDIUM: [
    'JUNGLE', 'TEMPLE', 'RELIC', 'RUNNER', 'FOREST', 'CHASM', 'BRIDGES', 'ANCIENT',
    'SHADOW', 'CANOPY', 'TORCH', 'VALLEY', 'STATUE', 'TOTEM', 'GOLDEN', 'SHRINE',
    'SWIFT', 'SECRET', 'DANGER', 'PORTAL', 'HIDDEN', 'SAFARI', 'PILLAR', 'STONES',
    'TREK', 'ESCORT', 'BEACON', 'RAIDER', 'JADE', 'MYSTIC', 'CAVERN', 'SUMMIT'
  ],

  // 7-8 letter words (Hard / Expedition Vocabulary)
  LONG: [
    'EXPLORER', 'WATERFALL', 'TREASURE', 'KEYSTONE', 'PYRAMID', 'BOULDER',
    'PLATFORM', 'WARRIOR', 'SANCTUARY', 'MONOLITH', 'OVERGROWTH', 'LABYRINTH',
    'HORIZON', 'EXPEDITION', 'CHAMPION', 'ADVENTURE', 'LIGHTNING', 'PASSAGE',
    'CRUMBLE', 'COLLAPSE', 'OBSIDIAN', 'VIGILANT', 'PRECIPICE', 'EMERALD'
  ],

  // 9+ letter words (Master / Ancient Civilization Lore)
  MASTER: [
    'ARCHAEOLOGY', 'CIVILIZATION', 'TRAJECTORY', 'OVERCOMING', 'CATACOMBS',
    'SUBTERRANEAN', 'ENDURANCE', 'ACCELERATION', 'NAVIGATOR', 'INVULNERABLE',
    'WONDERLAND', 'MAJESTIC', 'PETROGLYPH', 'HIEROGLYPH', 'RELINQUISH'
  ],
};

export function getRandomWord(currentWPM: number): string {
  let pool: string[];

  if (currentWPM < 30) {
    // 70% short, 30% medium
    pool = Math.random() < 0.7 ? WORD_BANK.SHORT : WORD_BANK.MEDIUM;
  } else if (currentWPM < 55) {
    // 30% short, 50% medium, 20% long
    const r = Math.random();
    if (r < 0.3) pool = WORD_BANK.SHORT;
    else if (r < 0.8) pool = WORD_BANK.MEDIUM;
    else pool = WORD_BANK.LONG;
  } else if (currentWPM < 80) {
    // 15% short, 45% medium, 35% long, 5% master
    const r = Math.random();
    if (r < 0.15) pool = WORD_BANK.SHORT;
    else if (r < 0.6) pool = WORD_BANK.MEDIUM;
    else if (r < 0.95) pool = WORD_BANK.LONG;
    else pool = WORD_BANK.MASTER;
  } else {
    // Master level: long and master words predominate
    const r = Math.random();
    if (r < 0.1) pool = WORD_BANK.SHORT;
    else if (r < 0.4) pool = WORD_BANK.MEDIUM;
    else if (r < 0.8) pool = WORD_BANK.LONG;
    else pool = WORD_BANK.MASTER;
  }

  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
