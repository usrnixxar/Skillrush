import React from 'react';
import { GameStats, ActiveWordState, PlayerProfile } from '../types/game';
import { Pause, Volume2, VolumeX, Flame, Coins, ShieldCheck, Zap } from 'lucide-react';
import { audioManager } from '../game/systems/AudioManager';

interface HUDProps {
  stats: GameStats;
  activeWord: ActiveWordState;
  profile: PlayerProfile;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  activeWord,
  profile,
  isMuted,
  onToggleMute,
  onPause,
}) => {
  // WPM tier indicator
  const getWpmColor = (wpm: number) => {
    if (wpm >= 75) return 'text-amber-400 border-amber-500/60 shadow-amber-500/20';
    if (wpm >= 50) return 'text-emerald-400 border-emerald-500/60 shadow-emerald-500/20';
    return 'text-teal-300 border-teal-500/50 shadow-teal-500/20';
  };

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none z-30 flex flex-col items-center p-2.5 sm:p-4 select-none">
      {/* Top Status Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between gap-2 md:gap-4 pointer-events-auto">
        {/* Player Profile & High Score */}
        <div className="flex items-center gap-2 md:gap-3 bg-stone-900/90 backdrop-blur-md px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl border border-amber-600/40 shadow-xl">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-950/70 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
            {profile.isStudent ? <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs md:text-sm font-bold text-amber-200 tracking-wide flex items-center gap-1.5 truncate">
              <span className="truncate">{profile.name}</span>
              {profile.isStudent && (
                <span className="text-[9px] sm:text-[10px] px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40 font-medium shrink-0">
                  STUDENT
                </span>
              )}
            </span>
            <span className="text-[9px] md:text-xs text-stone-400 truncate">
              High: <strong className="text-amber-300">{profile.highScore}</strong> | Best: <strong className="text-emerald-400">{profile.highestWPM} WPM</strong>
            </span>
          </div>
        </div>

        {/* Live Metrics: WPM, Accuracy, Distance, Score (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center gap-2 md:gap-3">
          {/* Live WPM Gauge */}
          <div className={`flex flex-col items-center bg-stone-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border shadow-lg ${getWpmColor(stats.currentWPM)}`}>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Live WPM</span>
            <span className="text-lg md:text-xl font-black font-mono-game leading-tight">{stats.currentWPM}</span>
          </div>

          {/* Accuracy */}
          <div className="flex flex-col items-center bg-stone-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-stone-700/60 shadow-lg text-emerald-400">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Accuracy</span>
            <span className="text-lg md:text-xl font-black font-mono-game leading-tight">{stats.accuracy}%</span>
          </div>

          {/* Distance */}
          <div className="flex flex-col items-center bg-stone-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-stone-700/60 shadow-lg text-cyan-300">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Distance</span>
            <span className="text-lg md:text-xl font-black font-mono-game leading-tight">{stats.distance}m</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center bg-stone-900/90 backdrop-blur-md px-4 py-1.5 rounded-xl border border-amber-500/50 shadow-lg text-amber-300">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Score</span>
            <span className="text-lg md:text-xl font-black font-mono-game leading-tight">{stats.score}</span>
          </div>
        </div>

        {/* Coins, Combo & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Coins collected */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-stone-900/90 backdrop-blur-md px-2 sm:px-2.5 py-1.5 rounded-xl border border-amber-500/40 text-amber-300 font-bold text-xs sm:text-sm shadow-md">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />
            <span>{stats.coinsCollected}</span>
          </div>

          {/* Combo Streak */}
          {stats.comboStreak > 1 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-600 to-amber-600 px-2 sm:px-2.5 py-1.5 rounded-xl text-stone-950 font-black text-xs sm:text-sm animate-pulse shadow-lg shadow-orange-500/30">
              <Flame className="w-3.5 h-3.5 fill-stone-950" />
              <span>x{stats.comboStreak}</span>
            </div>
          )}

          {/* Audio toggle */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onToggleMute();
            }}
            aria-label="Toggle Audio"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-stone-800/90 border border-stone-600/70 text-amber-300 hover:bg-stone-700 transition active:scale-95 shadow-md"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Pause */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onPause();
            }}
            aria-label="Pause Game"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-stone-800/90 border border-stone-600/70 text-amber-300 hover:bg-stone-700 transition active:scale-95 shadow-md"
          >
            <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Mobile-only compact stats ribbon */}
      <div className="sm:hidden w-full flex items-center justify-center gap-2 mt-1.5 pointer-events-auto">
        <div className="flex items-center gap-3 bg-stone-900/90 backdrop-blur-md px-3 py-1 rounded-xl border border-stone-700/60 shadow-lg text-xs font-mono-game">
          <span className="text-amber-400"><strong>{stats.currentWPM}</strong> WPM</span>
          <span className="text-stone-600">|</span>
          <span className="text-emerald-400"><strong>{stats.accuracy}%</strong> ACC</span>
          <span className="text-stone-600">|</span>
          <span className="text-cyan-300"><strong>{stats.distance}</strong>m</span>
          <span className="text-stone-600">|</span>
          <span className="text-amber-300"><strong>{stats.score}</strong> PTS</span>
        </div>
      </div>

      {/* Floating Target Word Display (Center Screen Focus) */}
      <div className="mt-2.5 sm:mt-6 md:mt-8 flex flex-col items-center">
        <div
          className={`px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-2xl border-2 backdrop-blur-xl shadow-2xl transition-all duration-150 flex items-center gap-1.5 sm:gap-2 ${
            activeWord.isError
              ? 'bg-rose-950/90 border-rose-500 shadow-rose-900/50 translate-x-1'
              : activeWord.isCompleted
              ? 'bg-emerald-950/90 border-emerald-400 shadow-emerald-900/60 scale-105'
              : 'bg-stone-900/92 border-amber-500/70 shadow-amber-950/40'
          }`}
        >
          {activeWord.word.split('').map((char, index) => {
            const isTyped = index < activeWord.typed.length;
            const isNext = index === activeWord.typed.length;

            let charColor = 'text-stone-300';
            let bgTile = 'bg-stone-800/70 border-stone-700';

            if (isTyped) {
              charColor = 'text-emerald-400 font-black';
              bgTile = 'bg-emerald-950/60 border-emerald-500/70 shadow-sm shadow-emerald-500/40';
            } else if (isNext) {
              if (activeWord.isError) {
                charColor = 'text-rose-400 font-black animate-bounce';
                bgTile = 'bg-rose-950/70 border-rose-500/80 shadow-sm shadow-rose-500/40';
              } else {
                charColor = 'text-amber-300 font-extrabold';
                bgTile = 'bg-amber-950/60 border-amber-500/70 ring-2 ring-amber-400/50';
              }
            }

            return (
              <span
                key={index}
                className={`w-7 h-9 sm:w-9 sm:h-11 md:w-10 md:h-12 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-mono-game uppercase rounded-lg border tracking-wider transition-all duration-100 ${charColor} ${bgTile}`}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Small subtitle indicator */}
        <span className="text-[10px] sm:text-xs font-semibold text-amber-200/80 mt-1 uppercase tracking-widest drop-shadow-md">
          {activeWord.isCompleted ? 'Wall Collapsed! Keep Running!' : 'Type Target Word'}
        </span>
      </div>
    </div>
  );
};
