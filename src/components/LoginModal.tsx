import React, { useState } from 'react';
import { PlayerProfile } from '../types/game';
import { X, ShieldCheck, User, KeyRound, Check } from 'lucide-react';
import { audioManager } from '../game/systems/AudioManager';

interface LoginModalProps {
  currentProfile: PlayerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: PlayerProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  currentProfile,
  isOpen,
  onClose,
  onSaveProfile,
}) => {
  const [tab, setTab] = useState<'student' | 'guest'>(currentProfile.isStudent ? 'student' : 'guest');
  const [studentName, setStudentName] = useState(currentProfile.isStudent ? currentProfile.name : '');
  const [studentPin, setStudentPin] = useState(currentProfile.studentPin || '');
  const [guestName, setGuestName] = useState(!currentProfile.isStudent ? currentProfile.name : 'Guest Explorer');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!studentPin.trim() || studentPin.length < 4) {
      setErrorMsg('Student PIN must be at least 4 digits');
      return;
    }

    audioManager.playButtonClick();
    onSaveProfile({
      ...currentProfile,
      name: studentName.trim(),
      isStudent: true,
      studentPin: studentPin.trim(),
    });
    onClose();
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMsg('Please enter a player nickname');
      return;
    }

    audioManager.playButtonClick();
    onSaveProfile({
      ...currentProfile,
      name: guestName.trim(),
      isStudent: false,
      studentPin: undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md stone-panel p-6 rounded-2xl relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={() => {
            audioManager.playButtonClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black font-ancient text-amber-400 tracking-wider">
            PLAYER PROFILE
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Choose your mode to track your typing adventure records
          </p>
        </div>

        {/* Tabs: Student vs Guest */}
        <div className="flex rounded-xl bg-stone-900/90 p-1 border border-stone-800 mb-6">
          <button
            type="button"
            onClick={() => {
              audioManager.playButtonClick();
              setTab('student');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wide transition flex items-center justify-center gap-1.5 ${
              tab === 'student'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Student Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audioManager.playButtonClick();
              setTab('guest');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wide transition flex items-center justify-center gap-1.5 ${
              tab === 'guest'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Guest Play</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Student Login Form */}
        {tab === 'student' ? (
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950/90 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-sm"
                />
                <User className="absolute right-3 top-3 w-4 h-4 text-stone-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider mb-1">
                Student PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={studentPin}
                  onChange={e => setStudentPin(e.target.value)}
                  placeholder="e.g. 1024"
                  maxLength={6}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950/90 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-sm tracking-widest font-mono-game"
                />
                <KeyRound className="absolute right-3 top-3 w-4 h-4 text-stone-500" />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                *Demo student PIN is saved locally on this browser.
              </p>
            </div>

            <button
              type="submit"
              className="w-full gold-button py-3 rounded-xl font-bold text-sm tracking-wider flex items-center justify-center gap-2 mt-2 shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>LOGIN AS STUDENT</span>
            </button>
          </form>
        ) : (
          /* Guest Play Form */
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider mb-1">
                Player Nickname
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="e.g. JungleRunner"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950/90 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-sm"
                />
                <User className="absolute right-3 top-3 w-4 h-4 text-stone-500" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full gold-button py-3 rounded-xl font-bold text-sm tracking-wider flex items-center justify-center gap-2 mt-4 shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>CONTINUE AS GUEST</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
