import React, { useEffect } from 'react';
import { GameStats, PlayerProfile } from '../types/game';
import { RotateCcw, Trophy, Home, Award, Zap, Coins, Crosshair, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../game/systems/AudioManager';

interface GameOverModalProps {
  isOpen: boolean;
  stats: GameStats;
  profile: PlayerProfile;
  isNewRecord: boolean;
  onPlayAgain: () => void;
  onOpenLeaderboard: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  profile,
  isNewRecord,
  onPlayAgain,
  onOpenLeaderboard,
  onMainMenu,
}) => {
  useEffect(() => {
    if (isOpen && isNewRecord) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#fbbf24', '#ffffff'],
        });
      } catch (e) {
        console.warn('Confetti error', e);
      }
    }
  }, [isOpen, isNewRecord]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto">
      <div className="w-full max-w-lg stone-panel p-5 sm:p-7 rounded-3xl text-center shadow-2xl relative my-auto">
        {/* Relic Banner / New Record Badge */}
        {isNewRecord && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
            <span>NEW PERSONAL RECORD!</span>
          </div>
        )}

        <h2 className="text-3xl sm:text-4xl font-black font-ancient text-rose-500 tracking-wider mb-1 mt-1 text-glow-crimson">
          RUN CONCLUDED
        </h2>
        <p className="text-xs text-stone-400 mb-5">
          Explorer <strong className="text-amber-300">{profile.name}</strong> braved the ancient temple chasms!
        </p>

        {/* Big Highlights: Score & Distance */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-stone-950/70 border border-amber-500/40 shadow-inner flex flex-col items-center">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Final Score</span>
            <span className="text-3xl sm:text-4xl font-black font-mono-game text-amber-400 mt-0.5">{stats.score}</span>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-stone-950/70 border border-cyan-500/40 shadow-inner flex flex-col items-center">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Distance Survived</span>
            <span className="text-3xl sm:text-4xl font-black font-mono-game text-cyan-300 mt-0.5">{stats.distance}m</span>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 mb-6 text-left">
          {/* Average WPM */}
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">Avg WPM</div>
              <div className="text-base font-black font-mono-game text-stone-100">{stats.averageWPM}</div>
            </div>
          </div>

          {/* Peak WPM */}
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">Peak WPM</div>
              <div className="text-base font-black font-mono-game text-amber-300">{stats.peakWPM}</div>
            </div>
          </div>

          {/* Accuracy */}
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-950/80 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">Accuracy</div>
              <div className="text-base font-black font-mono-game text-teal-300">{stats.accuracy}%</div>
            </div>
          </div>

          {/* Words Completed */}
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">Gates Lowered</div>
              <div className="text-base font-black font-mono-game text-stone-100">{stats.wordsCompleted}</div>
            </div>
          </div>

          {/* Coins Collected */}
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">Coins Found</div>
              <div className="text-base font-black font-mono-game text-amber-300">{stats.coinsCollected}</div>
            </div>
          </div>

          {/* Typo mistakes */}
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <span className="font-bold text-xs">ERR</span>
            </div>
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">Mistakes</div>
              <div className="text-base font-black font-mono-game text-rose-400">{stats.wrongKeystrokes}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onPlayAgain();
            }}
            className="w-full gold-button py-3.5 px-6 rounded-2xl text-lg font-black tracking-wider flex items-center justify-center gap-2 shadow-xl"
          >
            <RotateCcw className="w-5 h-5 fill-stone-950" />
            <span>PLAY AGAIN</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                audioManager.playButtonClick();
                onOpenLeaderboard();
              }}
              className="stone-button py-2.5 px-4 rounded-xl text-sm font-bold text-stone-200 flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => {
                audioManager.playButtonClick();
                onMainMenu();
              }}
              className="stone-button py-2.5 px-4 rounded-xl text-sm font-bold text-stone-200 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-stone-400" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
