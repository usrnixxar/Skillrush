import { LeaderboardEntry } from '../types/game';

const LEADERBOARD_KEY = 'skillence_type_runner_leaderboard';

// Realistic starter leaderboard seeded for Skillence Academy students
const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', rank: 1, name: 'Aarav Sharma', isStudent: true, highestWPM: 92, score: 9840, distance: 1820, date: '2026-10-07', category: 'all-time' },
  { id: '2', rank: 2, name: 'Maya Patel', isStudent: true, highestWPM: 86, score: 8760, distance: 1650, date: '2026-10-06', category: 'all-time' },
  { id: '3', rank: 3, name: 'Rohan Gupta', isStudent: true, highestWPM: 79, score: 7920, distance: 1480, date: '2026-10-05', category: 'all-time' },
  { id: '4', rank: 4, name: 'Ananya Rao', isStudent: true, highestWPM: 74, score: 7150, distance: 1320, date: '2026-10-07', category: 'all-time' },
  { id: '5', rank: 5, name: 'Dev Sen', isStudent: false, highestWPM: 68, score: 6420, distance: 1190, date: '2026-10-04', category: 'all-time' },

  { id: '6', rank: 1, name: 'Maya Patel', isStudent: true, highestWPM: 86, score: 8760, distance: 1650, date: '2026-10-07', category: 'weekly' },
  { id: '7', rank: 2, name: 'Aarav Sharma', isStudent: true, highestWPM: 84, score: 8320, distance: 1540, date: '2026-10-07', category: 'weekly' },
  { id: '8', rank: 3, name: 'Ananya Rao', isStudent: true, highestWPM: 74, score: 7150, distance: 1320, date: '2026-10-07', category: 'weekly' },

  { id: '9', rank: 1, name: 'Aarav Sharma', isStudent: true, highestWPM: 92, score: 9840, distance: 1820, date: '2026-10-08', category: 'daily' },
  { id: '10', rank: 2, name: 'Kavya Nair', isStudent: true, highestWPM: 62, score: 5410, distance: 980, date: '2026-10-08', category: 'daily' },
  { id: '11', rank: 3, name: 'Vihaan Verma', isStudent: true, highestWPM: 58, score: 4890, distance: 890, date: '2026-10-08', category: 'daily' },
];

export const leaderboardService = {
  getEntries(category: 'daily' | 'weekly' | 'all-time'): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(LEADERBOARD_KEY);
      const all: LeaderboardEntry[] = data ? JSON.parse(data) : DEFAULT_LEADERBOARD;
      return all
        .filter(item => item.category === category)
        .sort((a, b) => b.score - a.score)
        .map((item, idx) => ({ ...item, rank: idx + 1 }));
    } catch (e) {
      console.warn('Failed to fetch leaderboard data', e);
      return DEFAULT_LEADERBOARD.filter(item => item.category === category);
    }
  },

  addEntry(entry: Omit<LeaderboardEntry, 'id' | 'rank' | 'date'>): LeaderboardEntry {
    try {
      const data = localStorage.getItem(LEADERBOARD_KEY);
      const all: LeaderboardEntry[] = data ? JSON.parse(data) : [...DEFAULT_LEADERBOARD];

      const today = new Date().toISOString().split('T')[0];
      const newEntry: LeaderboardEntry = {
        ...entry,
        id: 'entry_' + Date.now(),
        date: today,
      };

      all.push(newEntry);
      // Also register into all-time if not already
      if (entry.category !== 'all-time') {
        all.push({
          ...newEntry,
          id: 'entry_all_' + Date.now(),
          category: 'all-time',
        });
      }

      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(all));
      return newEntry;
    } catch (e) {
      console.warn('Failed to add leaderboard entry', e);
      return { ...entry, id: 'temp', date: 'today' };
    }
  },
};
