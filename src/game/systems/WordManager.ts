import { GAME_CONFIG } from '../config/GameConfig';
import { getRandomWord } from '../config/WordBank';

export interface CompletedWordRecord {
  word: string;
  durationMs: number;
  wpm: number;
  accuracy: number;
  timestamp: number;
}

export class WordManager {
  private recentWords: CompletedWordRecord[] = [];
  private smoothedWPM = GAME_CONFIG.WPM.INITIAL_WPM;
  private peakWPM = GAME_CONFIG.WPM.INITIAL_WPM;

  private currentTargetWord = '';
  private currentTypedInput = '';
  private currentWordStartTime = 0;
  private currentWordMistakes = 0;

  private totalKeystrokes = 0;
  private wrongKeystrokes = 0;
  private totalWordsCompleted = 0;

  constructor() {
    this.reset();
  }

  public reset() {
    this.recentWords = [];
    this.smoothedWPM = GAME_CONFIG.WPM.INITIAL_WPM;
    this.peakWPM = GAME_CONFIG.WPM.INITIAL_WPM;
    this.currentTargetWord = getRandomWord(this.smoothedWPM);
    this.currentTypedInput = '';
    this.currentWordStartTime = performance.now();
    this.currentWordMistakes = 0;
    this.totalKeystrokes = 0;
    this.wrongKeystrokes = 0;
    this.totalWordsCompleted = 0;
  }

  public setTargetWord(word: string) {
    this.currentTargetWord = word;
    this.currentTypedInput = '';
    this.currentWordStartTime = performance.now();
    this.currentWordMistakes = 0;
  }

  public getCurrentWord(): string {
    return this.currentTargetWord;
  }

  public getTypedInput(): string {
    return this.currentTypedInput;
  }

  public getSmoothedWPM(): number {
    return Math.round(this.smoothedWPM);
  }

  public getPeakWPM(): number {
    return Math.round(this.peakWPM);
  }

  public getAccuracy(): number {
    if (this.totalKeystrokes === 0) return 100;
    const correct = Math.max(0, this.totalKeystrokes - this.wrongKeystrokes);
    return Math.min(100, Math.max(0, Math.round((correct / this.totalKeystrokes) * 100)));
  }

  public getStats() {
    return {
      smoothedWPM: this.getSmoothedWPM(),
      peakWPM: this.getPeakWPM(),
      accuracy: this.getAccuracy(),
      totalKeystrokes: this.totalKeystrokes,
      wrongKeystrokes: this.wrongKeystrokes,
      totalWordsCompleted: this.totalWordsCompleted,
    };
  }

  /**
   * Handles user keystroke input.
   * Returns:
   *   'CORRECT': key matches next letter
   *   'WRONG': key does not match
   *   'COMPLETED': full word correctly entered
   *   'BACKSPACE': character removed
   *   'IGNORED': invalid or non-typing key
   */
  public handleKeyInput(key: string): 'CORRECT' | 'WRONG' | 'COMPLETED' | 'BACKSPACE' | 'IGNORED' {
    if (key === 'Backspace') {
      if (this.currentTypedInput.length > 0) {
        this.currentTypedInput = this.currentTypedInput.slice(0, -1);
        return 'BACKSPACE';
      }
      return 'IGNORED';
    }

    if (key.length !== 1) return 'IGNORED';

    // Normalize letter
    const char = key.toUpperCase();
    if (!/^[A-Z]$/.test(char)) return 'IGNORED';

    this.totalKeystrokes++;
    const nextExpectedIndex = this.currentTypedInput.length;
    const expectedChar = this.currentTargetWord[nextExpectedIndex];

    if (char === expectedChar) {
      this.currentTypedInput += char;

      if (this.currentTypedInput === this.currentTargetWord) {
        // Word is finished!
        this.recordWordCompletion();
        return 'COMPLETED';
      }
      return 'CORRECT';
    } else {
      // Mistake
      this.wrongKeystrokes++;
      this.currentWordMistakes++;
      return 'WRONG';
    }
  }

  private recordWordCompletion() {
    const now = performance.now();
    const durationMs = Math.max(250, now - this.currentWordStartTime);
    const durationMinutes = durationMs / 60000;

    // Standard typing formula: (characters / 5) / minutes
    const standardWordCount = this.currentTargetWord.length / 5;
    const rawWPM = standardWordCount / durationMinutes;
    const wordWPM = Math.min(180, Math.max(15, rawWPM));

    const wordAccuracy = this.currentTargetWord.length / (this.currentTargetWord.length + this.currentWordMistakes);

    this.recentWords.push({
      word: this.currentTargetWord,
      durationMs,
      wpm: wordWPM,
      accuracy: wordAccuracy,
      timestamp: now,
    });

    if (this.recentWords.length > GAME_CONFIG.WPM.SMOOTHING_WINDOW) {
      this.recentWords.shift();
    }

    // Compute smoothed WPM with exponential/moving average
    const sumWPM = this.recentWords.reduce((acc, curr) => acc + curr.wpm, 0);
    this.smoothedWPM = Math.min(
      GAME_CONFIG.WPM.MAX_WPM,
      Math.max(GAME_CONFIG.WPM.MIN_WPM, sumWPM / this.recentWords.length)
    );

    if (this.smoothedWPM > this.peakWPM) {
      this.peakWPM = this.smoothedWPM;
    }

    this.totalWordsCompleted++;
  }

  /**
   * Generates a new random word suited for current smoothed WPM
   */
  public generateNextWord(): string {
    return getRandomWord(this.smoothedWPM);
  }

  /**
   * Calculates dynamic platform road length based on required formula:
   * estimatedTypingSeconds = (wordLength / 5) * (60 / smoothedWPM)
   * availableTime = estimatedTypingSeconds * difficultyMultiplier + reactionBuffer
   * roadLength = playerSpeed * availableTime + requiredSafetyDistance
   */
  public calculateRoadLength(word: string, playerSpeed: number): number {
    const wordLength = word.length;
    const wpm = Math.max(15, this.smoothedWPM);

    // Dynamic reaction buffer: 1.8s for 20 WPM, scaling down to 0.9s at 100 WPM
    const wpmRatio = Math.min(1, Math.max(0, (wpm - 20) / 80));
    const reactionBuffer = 1.8 - wpmRatio * 0.9;

    // Difficulty multiplier: 1.1 down to 0.88
    const difficultyMultiplier = 1.1 - wpmRatio * 0.22;

    const estimatedTypingSeconds = (wordLength / 5) * (60 / wpm);
    const availableTime = estimatedTypingSeconds * difficultyMultiplier + reactionBuffer;

    // Safety distance accounts for takeoff room and platform visual borders
    const requiredSafetyDistance = 240;

    const rawRoadLength = playerSpeed * availableTime + requiredSafetyDistance;

    // Clamp within safe limits
    return Math.round(
      Math.min(
        GAME_CONFIG.WORLD.MAX_ROAD_LENGTH,
        Math.max(GAME_CONFIG.WORLD.MIN_ROAD_LENGTH, rawRoadLength)
      )
    );
  }
}
