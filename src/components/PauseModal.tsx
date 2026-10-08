import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../game/systems/AudioManager';

interface PauseModalProps {
  isOpen: boolean;
  isMuted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  isMuted,
  onResume,
  onRestart,
  onMainMenu,
  onToggleMute,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-sm stone-panel p-6 rounded-2xl text-center shadow-2xl">
        <h2 className="text-3xl font-black font-ancient text-amber-400 tracking-wider mb-2">
          EXPEDITION PAUSED
        </h2>
        <p className="text-xs text-stone-400 mb-6">
          Take a breath, explorer. The ruins await your command.
        </p>

        <div className="space-y-3">
          {/* Resume */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onResume();
            }}
            className="w-full gold-button py-3 px-4 rounded-xl text-base font-black flex items-center justify-center gap-2.5 shadow-lg"
          >
            <Play className="w-5 h-5 fill-stone-950" />
            <span>RESUME RUN</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onRestart();
            }}
            className="w-full stone-button py-2.5 px-4 rounded-xl text-sm font-bold text-stone-200 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart Run</span>
          </button>

          {/* Sound Toggle in Pause */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onToggleMute();
            }}
            className="w-full stone-button py-2.5 px-4 rounded-xl text-sm font-bold text-stone-200 flex items-center justify-center gap-2"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onMainMenu();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 text-sm font-semibold flex items-center justify-center gap-2 transition"
          >
            <Home className="w-4 h-4" />
            <span>Exit to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
