import React from 'react';
import { AudioSettings } from '../types/game';
import { X, Volume2, VolumeX, Music, Bell } from 'lucide-react';
import { audioManager } from '../game/systems/AudioManager';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AudioSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md stone-panel p-6 rounded-2xl shadow-2xl relative">
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
          <h2 className="text-2xl font-black font-ancient text-amber-400 tracking-wider">
            AUDIO & CONTROLS
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Fine-tune the temple ambience and sound effects
          </p>
        </div>

        <div className="space-y-5">
          {/* Mute Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900/80 border border-stone-800">
            <div className="flex items-center gap-2.5">
              {settings.isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
              <div>
                <div className="text-sm font-bold text-stone-200">Mute All Audio</div>
                <div className="text-[10px] text-stone-400">Silences temple music and sound effects</div>
              </div>
            </div>
            <button
              onClick={() => {
                audioManager.playButtonClick();
                onUpdateSettings({ isMuted: !settings.isMuted });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.isMuted ? 'bg-rose-900' : 'bg-emerald-600'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.isMuted ? 'left-1' : 'right-1'
                }`}
              />
            </button>
          </div>

          {/* Master Volume Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-stone-300">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-400" /> Master Volume
              </span>
              <span className="font-mono-game text-amber-400">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              disabled={settings.isMuted}
              onChange={e => onUpdateSettings({ masterVolume: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Jungle Adventure Music Volume */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-stone-300">
              <span className="flex items-center gap-1.5">
                <Music className="w-4 h-4 text-emerald-400" /> Jungle BGM Volume
              </span>
              <span className="font-mono-game text-emerald-400">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              disabled={settings.isMuted}
              onChange={e => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Sound Effects Volume */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-stone-300">
              <span className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-cyan-400" /> SFX Volume (Typing & Gates)
              </span>
              <span className="font-mono-game text-cyan-400">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              disabled={settings.isMuted}
              onChange={e => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={() => {
            audioManager.playButtonClick();
            onClose();
          }}
          className="w-full stone-button py-2.5 rounded-xl font-bold text-xs tracking-wider text-stone-200 mt-6"
        >
          DONE
        </button>
      </div>
    </div>
  );
};
