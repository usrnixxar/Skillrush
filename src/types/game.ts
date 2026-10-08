export interface PlayerProfile {
  name: string;
  isStudent: boolean;
  studentPin?: string;
  avatarId?: string;
  highScore: number;
  highestWPM: number;
  totalRuns: number;
  totalCoins: number;
}

export interface GameStats {
  score: number;
  distance: number;
  currentWPM: number;
  averageWPM: number;
  peakWPM: number;
  accuracy: number;
  wordsCompleted: number;
  totalKeystrokes: number;
  wrongKeystrokes: number;
  coinsCollected: number;
  comboStreak: number;
  maxCombo: number;
  durationSeconds: number;
}

export interface ActiveWordState {
  word: string;
  typed: string;
  isError: boolean;
  isCompleted: boolean;
}

export interface LeaderboardEntry {
  id: string;
  rank?: number;
  name: string;
  isStudent: boolean;
  highestWPM: number;
  score: number;
  distance: number;
  date: string;
  category: 'daily' | 'weekly' | 'all-time';
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
}

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';
