import React, { useEffect, useRef, useState } from 'react';
import { Delete, Keyboard as KeyboardIcon, EyeOff } from 'lucide-react';

interface MobileKeyboardProps {
  onKeyPress: (key: string) => void;
  isActive: boolean;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const MobileKeyboard: React.FC<MobileKeyboardProps> = ({ onKeyPress, isActive }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);

  // Auto-focus the invisible mobile input to bring up system keyboard if virtual is off
  useEffect(() => {
    if (isActive && !showVirtualKeyboard && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive, showVirtualKeyboard]);

  // Handle hidden input text entry
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length > 0) {
      const char = val[val.length - 1];
      onKeyPress(char);
      // Reset input value to keep receiving characters
      e.target.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      onKeyPress('Backspace');
    }
  };

  return (
    <>
      {/* Hidden Mobile Native Input: keeps native mobile keyboard alive */}
      <input
        ref={inputRef}
        type="text"
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="opacity-0 absolute -top-96 left-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Touch Screen Virtual Keyboard Toggle Button (visible on mobile screens) */}
      <div className="md:hidden absolute bottom-2 right-2 z-40">
        <button
          onClick={() => {
            setShowVirtualKeyboard(prev => !prev);
            if (showVirtualKeyboard && inputRef.current) {
              inputRef.current.focus();
            }
          }}
          className="p-2.5 rounded-xl bg-stone-900/90 border border-amber-500/60 text-amber-300 shadow-xl backdrop-blur-md active:scale-95 flex items-center gap-1.5 text-xs font-bold"
        >
          {showVirtualKeyboard ? <EyeOff className="w-4 h-4" /> : <KeyboardIcon className="w-4 h-4" />}
          <span>{showVirtualKeyboard ? 'Hide Pad' : 'Touch Keys'}</span>
        </button>
      </div>

      {/* Floating Onscreen Touch Keyboard Overlay for Mobile Devices */}
      {showVirtualKeyboard && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-stone-950/95 border-t-2 border-amber-600/60 p-2 pb-4 backdrop-blur-xl shadow-2xl flex flex-col gap-1.5 select-none animate-in slide-in-from-bottom duration-200">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1">
              {row.map(key => (
                <button
                  key={key}
                  onClick={() => onKeyPress(key)}
                  className="w-8 sm:w-10 h-11 rounded-lg bg-stone-800 text-amber-100 font-bold text-lg active:bg-amber-600 active:text-stone-950 border border-stone-700 shadow-md transition-colors"
                >
                  {key}
                </button>
              ))}

              {/* Backspace button on bottom row */}
              {rIdx === 2 && (
                <button
                  onClick={() => onKeyPress('Backspace')}
                  className="px-3 h-11 rounded-lg bg-rose-950 text-rose-300 font-bold border border-rose-800 shadow-md active:bg-rose-700 active:text-white flex items-center justify-center"
                  aria-label="Backspace"
                >
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
