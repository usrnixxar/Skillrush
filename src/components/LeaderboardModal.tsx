import React, { useState, useMemo } from 'react';
import { LeaderboardEntry } from '../types/game';
import { leaderboardService } from '../services/leaderboardService';
import { X, Trophy, Medal, ShieldCheck, Zap } from 'lucide-react';
import { audioManager } from '../game/systems/AudioManager';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'daily' | 'weekly' | 'all-time'>('all-time');
  const entries = useMemo<LeaderboardEntry[]>(() => isOpen ? leaderboardService.getEntries(tab) : [], [isOpen, tab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl stone-panel p-5 sm:p-7 rounded-3xl shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Close button */}
        <button
          onClick={() => {
            audioManager.playButtonClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl sm:text-3xl font-black font-ancient text-amber-400 tracking-wider">
              TEMPLE RUNNERS
            </h2>
          </div>
          <p className="text-xs text-stone-400">
            Best runs on this browser • Daily / Sunday–Saturday (IST)
          </p>
        </div>

        {/* Time Period Tabs */}
        <div className="flex rounded-xl bg-stone-900/90 p-1 border border-stone-800 mb-4">
          {(['daily', 'weekly', 'all-time'] as const).map(category => (
            <button
              key={category}
              onClick={() => {
                audioManager.playButtonClick();
                setTab(category);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition capitalize ${
                tab === category
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {category.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-sm">
              No expeditions recorded in this category yet.
            </div>
          ) : (
            entries.map((item, index) => {
              const rank = index + 1;
              let rankBadge = (
                <span className="w-6 h-6 rounded-full bg-stone-800 text-stone-400 font-bold text-xs flex items-center justify-center">
                  #{rank}
                </span>
              );

              if (rank === 1) {
                rankBadge = (
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/50">
                    <Medal className="w-4 h-4 fill-stone-950" />
                  </span>
                );
              } else if (rank === 2) {
                rankBadge = (
                  <span className="w-6 h-6 rounded-full bg-slate-300 text-stone-950 font-black text-xs flex items-center justify-center shadow-md">
                    <Medal className="w-4 h-4 fill-stone-950" />
                  </span>
                );
              } else if (rank === 3) {
                rankBadge = (
                  <span className="w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow-md">
                    <Medal className="w-4 h-4 fill-amber-100" />
                  </span>
                );
              }

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-900/70 border border-stone-800 hover:border-amber-600/40 transition gap-3"
                >
                  {/* Left: Rank & Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    {rankBadge}
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-stone-200 truncate flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.isStudent && (
                          <span title="Academy Student">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {item.distance}m • {item.date}
                      </div>
                    </div>
                  </div>

                  {/* Right: WPM & Score */}
                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-stone-500 uppercase font-semibold">Speed</span>
                      <span className="text-sm font-extrabold font-mono-game text-emerald-400 flex items-center gap-0.5">
                        <Zap className="w-3 h-3" />
                        {item.highestWPM} WPM
                      </span>
                    </div>
                    <div className="flex flex-col items-end min-w-[65px]">
                      <span className="text-[10px] text-stone-500 uppercase font-semibold">Score</span>
                      <span className="text-base font-black font-mono-game text-amber-300">
                        {item.score}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
