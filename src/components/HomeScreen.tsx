import React from 'react';
import { PlayerProfile } from '../types/game';
import { Play, HelpCircle, Trophy, Settings, User, Volume2, VolumeX, ShieldCheck, Flame, Compass } from 'lucide-react';
import { audioManager } from '../game/systems/AudioManager';

interface HomeScreenProps {
  profile: PlayerProfile;
  isMuted: boolean;
  onStartGame: () => void;
  onOpenLogin: () => void;
  onOpenHowToPlay: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onToggleMute: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  isMuted,
  onStartGame,
  onOpenLogin,
  onOpenHowToPlay,
  onOpenLeaderboard,
  onOpenSettings,
  onToggleMute,
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#070e09] text-stone-100 select-none">
      {/* Background Illustrated Jungle Temple Layers */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/realistic-v1/jungle.webp)' }} />
        {/* Dark Vignette Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060b07] via-transparent to-[#070e09]/80" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 md:py-6 flex items-center justify-between">
        {/* Skillence Academy Logo & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-[2px] shadow-lg shadow-amber-900/40">
            <div className="w-full h-full rounded-[14px] bg-[#0c160f] flex items-center justify-center">
              <Compass className="w-6 h-6 text-amber-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-extrabold flex items-center gap-1.5">
              <span>SKILLENCE ACADEMY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-sm md:text-base font-bold text-stone-300 tracking-wide font-ancient">
              ANCIENT TYPING ADVENTURE
            </div>
          </div>
        </div>

        {/* Right Top Controls: Player Profile & Sound */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Profile Card Button */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onOpenLogin();
            }}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-stone-900/85 hover:bg-stone-800 border border-amber-600/40 shadow-md backdrop-blur-md transition active:scale-95 text-xs md:text-sm"
          >
            <User className="w-4 h-4 text-amber-400" />
            <div className="text-left hidden sm:block">
              <div className="font-bold text-amber-200 leading-tight flex items-center gap-1">
                {profile.name}
                {profile.isStudent && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />}
              </div>
              <div className="text-[10px] text-stone-400">
                WPM: {profile.highestWPM} | High: {profile.highScore}
              </div>
            </div>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onToggleMute();
            }}
            aria-label="Toggle Mute"
            className="p-2.5 rounded-xl bg-stone-900/85 hover:bg-stone-800 border border-stone-700 text-amber-300 shadow-md backdrop-blur-md transition active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Hero Center Content */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center my-auto py-6">
        {/* Animated Character Preview Running */}
        <div className="w-32 h-40 mx-auto mb-3 relative flex items-center justify-center">
          <img
            src="/assets/realistic-v1/explorer.webp"
            alt="Skillence Explorer"
            className="w-28 h-36 object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-explorer-breathe"
            
          />
          {/* Torchlight glow beneath */}
          <div className="absolute -bottom-2 w-28 h-6 bg-amber-500/25 blur-md rounded-full" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-decor tracking-wider text-amber-400 uppercase text-glow-gold">
          SKILLRUSH
        </h1>
        <div className="text-lg sm:text-2xl md:text-3xl font-black font-ancient tracking-widest text-stone-200 uppercase mt-[-4px] md:mt-[-8px]">
          TEMPLE TYPING ADVENTURE
        </div>

        {/* Tagline */}
        <p className="mt-3 text-base sm:text-lg md:text-xl font-medium text-amber-200/90 tracking-wide max-w-2xl mx-auto">
          "Type Fast. Break Walls. Run Further."
        </p>

        {/* Features badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-stone-300">
          <span className="px-3 py-1 rounded-full bg-stone-900/80 border border-amber-600/30 backdrop-blur-sm flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Dynamic WPM Speed
          </span>
          <span className="px-3 py-1 rounded-full bg-stone-900/80 border border-amber-600/30 backdrop-blur-sm flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Ancient Temple Ruins
          </span>
          <span className="px-3 py-1 rounded-full bg-stone-900/80 border border-amber-600/30 backdrop-blur-sm flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" /> Endless Procedural Chasm
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          {/* PLAY NOW BUTTON (Primary CTA) */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onStartGame();
            }}
            className="w-full sm:w-auto flex-1 gold-button py-3.5 px-8 rounded-2xl text-lg sm:text-xl font-black tracking-wider flex items-center justify-center gap-3 group shadow-2xl"
          >
            <Play className="w-6 h-6 fill-stone-950 group-hover:scale-110 transition-transform" />
            <span>PLAY NOW</span>
          </button>

          {/* HOW TO PLAY BUTTON */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onOpenHowToPlay();
            }}
            className="w-full sm:w-auto stone-button py-3.5 px-6 rounded-2xl text-base font-bold text-stone-200 flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>How to Play</span>
          </button>
        </div>

        {/* Secondary Bar: Leaderboards & Settings */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onOpenLeaderboard();
            }}
            className="px-4 py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-xs md:text-sm font-semibold text-stone-300 hover:text-amber-300 flex items-center gap-2 transition"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => {
              audioManager.playButtonClick();
              onOpenSettings();
            }}
            className="px-4 py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-xs md:text-sm font-semibold text-stone-300 hover:text-amber-300 flex items-center gap-2 transition"
          >
            <Settings className="w-4 h-4 text-stone-400" />
            <span>Audio & Controls</span>
          </button>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 text-center text-xs text-stone-500 border-t border-stone-800/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          © 2026 <strong className="text-amber-400">Skillence Academy</strong>. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-stone-400">
          <span>Type the word. Open the gate.</span>
          <span>•</span>
          <span>Your next jump is automatic.</span>
        </div>
      </footer>
    </div>
  );
};
