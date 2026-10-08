import { LeaderboardEntry } from '../types/game';

const LEADERBOARD_KEY = 'skillence_type_runner_leaderboard';
const indiaDate = (date: Date) => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(date);

function readRuns(): LeaderboardEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    // Keep real legacy runs; remove seeded demo rows and duplicated all-time copies.
    return parsed.filter((row): row is LeaderboardEntry => row &&
      typeof row.id === 'string' && !/^\d+$/.test(row.id) && !row.id.startsWith('entry_all_') &&
      typeof row.name === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
      Number.isFinite(row.score) && Number.isFinite(row.highestWPM) && Number.isFinite(row.distance));
  } catch {
    return [];
  }
}

export const leaderboardService = {
  getEntries(category: 'daily' | 'weekly' | 'all-time'): LeaderboardEntry[] {
    const today = indiaDate(new Date());
    const weekStart = new Date(`${today}T00:00:00Z`);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
    const sunday = weekStart.toISOString().slice(0, 10);
    const runs = readRuns().filter(row => category === 'all-time' ||
      (category === 'daily' ? row.date === today : row.date >= sunday && row.date <= today));
    const best = new Map<string, LeaderboardEntry>();
    for (const row of runs) {
      const key = `${row.isStudent}:${row.name.trim().toLowerCase()}`;
      const previous = best.get(key);
      if (!previous || row.score > previous.score || (row.score === previous.score && row.highestWPM > previous.highestWPM)) best.set(key, row);
    }
    return [...best.values()].sort((a, b) => b.score - a.score || b.highestWPM - a.highestWPM)
      .map((row, index) => ({ ...row, category, rank: index + 1 }));
  },

  addEntry(entry: Omit<LeaderboardEntry, 'id' | 'rank' | 'date'>): LeaderboardEntry {
    const run: LeaderboardEntry = { ...entry, id: `run_${crypto.randomUUID()}`, date: indiaDate(new Date()) };
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([...readRuns(), run]));
    } catch (error) {
      console.warn('Unable to save this run on this device', error);
    }
    return run;
  },
};
