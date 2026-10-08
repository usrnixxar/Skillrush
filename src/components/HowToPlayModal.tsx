import React from 'react';
import { X, Keyboard, ShieldAlert, FastForward, Trophy, Sparkles } from 'lucide-react';
import { audioManager } from '../game/systems/AudioManager';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto">
      <div className="w-full max-w-2xl stone-panel p-5 sm:p-7 rounded-3xl shadow-2xl relative my-auto">
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

        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black font-ancient text-amber-400 tracking-wider">
            HOW TO PLAY
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Master the ancient typing mechanics of Skillence Type Runner
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6 text-left">
          {/* Card 1 */}
          <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-200">1. Type the Word</h3>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                An ancient word floats above each temple barrier. Start typing immediately on your keyboard.
                Correct letters shine <strong className="text-emerald-400">green</strong>; mistakes highlight in <strong className="text-rose-400">red</strong>.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-300">2. Lower the Gate</h3>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Completing the word triggers the stone gate lowering animation with ground tremors and dust debris, clearing the path ahead.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <FastForward className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-cyan-300">3. Automatic Jump</h3>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                No jump key needed! Once the gate is opened, your explorer continues running and automatically leaps across the chasm at the platform edge.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-300">4. Dynamic WPM Roads</h3>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                The game begins at 25 WPM. As your sustained typing speed surges, platforms shorten dynamically, testing your speed and precision!
              </p>
            </div>
          </div>
        </div>

        {/* WPM Roadmap Table */}
        <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 text-left mb-6">
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>Difficulty Progression Roadmap</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-xs">
            <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
              <div className="font-mono-game font-bold text-teal-300">25 WPM</div>
              <div className="text-[10px] text-stone-400 mt-0.5">Beginner</div>
            </div>
            <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
              <div className="font-mono-game font-bold text-emerald-300">35 WPM</div>
              <div className="text-[10px] text-stone-400 mt-0.5">Easy</div>
            </div>
            <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
              <div className="font-mono-game font-bold text-amber-300">50 WPM</div>
              <div className="text-[10px] text-stone-400 mt-0.5">Medium</div>
            </div>
            <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
              <div className="font-mono-game font-bold text-orange-400">65 WPM</div>
              <div className="text-[10px] text-stone-400 mt-0.5">Hard</div>
            </div>
            <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
              <div className="font-mono-game font-bold text-rose-400">80 WPM</div>
              <div className="text-[10px] text-stone-400 mt-0.5">Expert</div>
            </div>
            <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
              <div className="font-mono-game font-bold text-purple-400">100+ WPM</div>
              <div className="text-[10px] text-stone-400 mt-0.5">Master</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            audioManager.playButtonClick();
            onClose();
          }}
          className="w-full gold-button py-3 rounded-xl font-black text-sm tracking-wider"
        >
          READY TO RUN
        </button>
      </div>
    </div>
  );
};
