import { AudioSettings } from '../../types/game';

class AudioManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private isPlayingMusic = false;
  private musicTimer: number | null = null;
  private currentStep = 0;

  private settings: AudioSettings = {
    masterVolume: 0.8,
    musicVolume: 0.6,
    sfxVolume: 0.85,
    isMuted: false,
  };

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.applyVolumes();
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  public updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.applyVolumes();
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  private applyVolumes() {
    if (!this.masterGain || !this.musicGain || !this.sfxGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    const isMuted = this.settings.isMuted;

    this.masterGain.gain.setValueAtTime(isMuted ? 0 : this.settings.masterVolume, now);
    this.musicGain.gain.setValueAtTime(this.settings.musicVolume, now);
    this.sfxGain.gain.setValueAtTime(this.settings.sfxVolume, now);
  }

  // --- JUNGLE ADVENTURE MUSIC SYNTHESIZER ---
  public startMusic() {
    if (this.isPlayingMusic) return;
    this.init();
    if (!this.ctx) return;

    this.isPlayingMusic = true;
    this.currentStep = 0;
    this.scheduleMusicBeat();
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleMusicBeat() {
    if (!this.isPlayingMusic || !this.ctx || !this.musicGain) return;

    const tempo = 112; // BPM
    const stepDurationMs = (60 / tempo / 4) * 1000; // 16th note in ms

    // Drum & Melodic step patterns
    this.playMusicStep(this.currentStep);

    this.currentStep = (this.currentStep + 1) % 32;
    this.musicTimer = window.setTimeout(() => {
      this.scheduleMusicBeat();
    }, stepDurationMs);
  }

  private playMusicStep(step: number) {
    if (!this.ctx || !this.musicGain || this.settings.isMuted) return;

    const now = this.ctx.currentTime;

    // 1. Conga / Tribal kick on beats 0, 6, 12, 16, 22, 28
    if (step % 8 === 0 || step === 6 || step === 14 || step === 22) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      const pitch = step % 16 === 0 ? 85 : 120;
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.15);
    }

    // 2. Wooden percussive shaker on odd steps
    if (step % 2 === 1) {
      const bufferSize = this.ctx.sampleRate * 0.03;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(4500, now);
      filter.Q.setValueAtTime(4.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(step % 4 === 1 ? 0.08 : 0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start(now);
    }

    // 3. Mystical Jungle Ancient Flute / Kalimba Melody (Pentatonic Scale in D minor: D, F, G, A, C)
    const melodyScale = [293.66, 349.23, 392.00, 440.00, 523.25, 587.33];
    const melodyPattern: { [key: number]: number } = {
      0: 0, 3: 2, 6: 3, 10: 4, 14: 3, 16: 2, 20: 1, 24: 0, 27: 4, 30: 5
    };

    if (melodyPattern[step] !== undefined) {
      const freq = melodyScale[melodyPattern[step]];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.36);
    }
  }

  // --- SOUND EFFECTS ---
  public playTypeCorrect() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Crisp ascending click
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1420, now + 0.04);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playTypeWrong() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playGateOpen() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const now = this.ctx.currentTime;

    // Sub rumble + stone sliding grind
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(45, now + 0.5);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.56);
  }

  public playJump() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.22);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playLanding() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playCoin() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const now = this.ctx.currentTime;

    // Double chime: 1046.5Hz (C6) and 1318.5Hz (E6)
    [1046.5, 1318.5].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.2, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.23);
    });
  }

  public playCollision() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playGameOver() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const now = this.ctx.currentTime;

    // Descending somber temple bell chord
    [329.63, 293.66, 261.63, 220.00].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.2);

      gain.gain.setValueAtTime(0.25, now + idx * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.2 + 0.65);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.2);
      osc.stop(now + idx * 0.2 + 0.7);
    });
  }

  public playButtonClick() {
    if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const audioManager = new AudioManager();
