import { PlayerProfile, AudioSettings } from '../types/game';

const PROFILE_KEY = 'skillence_type_runner_profile';
const AUDIO_KEY = 'skillence_type_runner_audio';

export const storageService = {
  getProfile(): PlayerProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse profile from localStorage', e);
    }

    return {
      name: 'Explorer Guest',
      isStudent: false,
      highScore: 0,
      highestWPM: 25,
      totalRuns: 0,
      totalCoins: 0,
    };
  },

  saveProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage', e);
    }
  },

  updateBestStats(score: number, wpm: number, coins: number): PlayerProfile {
    const profile = this.getProfile();
    profile.highScore = Math.max(profile.highScore, score);
    profile.highestWPM = Math.max(profile.highestWPM, wpm);
    profile.totalRuns += 1;
    profile.totalCoins += coins;
    this.saveProfile(profile);
    return profile;
  },

  getAudioSettings(): AudioSettings {
    try {
      const data = localStorage.getItem(AUDIO_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse audio settings', e);
    }

    return {
      masterVolume: 0.8,
      musicVolume: 0.65,
      sfxVolume: 0.85,
      isMuted: false,
    };
  },

  saveAudioSettings(settings: AudioSettings): void {
    try {
      localStorage.setItem(AUDIO_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save audio settings', e);
    }
  },
};
