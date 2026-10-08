import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import type { GameState, GameStats, ActiveWordState, PlayerProfile, AudioSettings } from './types/game';
import { storageService } from './services/storageService';
import { leaderboardService } from './services/leaderboardService';
import { audioManager } from './game/systems/AudioManager';
import { HomeScreen } from './components/HomeScreen';
const GameCanvas = lazy(() => import('./components/GameCanvas').then(module => ({ default: module.GameCanvas })));
import { HUD } from './components/HUD';
import { MobileKeyboard } from './components/MobileKeyboard';
import { LoginModal } from './components/LoginModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';

const INITIAL_STATS: GameStats = {
  score: 0,
  distance: 0,
  currentWPM: 25,
  averageWPM: 25,
  peakWPM: 25,
  accuracy: 100,
  wordsCompleted: 0,
  totalKeystrokes: 0,
  wrongKeystrokes: 0,
  coinsCollected: 0,
  comboStreak: 0,
  maxCombo: 0,
  durationSeconds: 0,
};

const INITIAL_WORD_STATE: ActiveWordState = {
  word: 'RUN',
  typed: '',
  isError: false,
  isCompleted: false,
};

export function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [profile, setProfile] = useState<PlayerProfile>(() => storageService.getProfile());
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => storageService.getAudioSettings());

  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [activeWord, setActiveWord] = useState<ActiveWordState>(INITIAL_WORD_STATE);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Ref to canvas control functions (restart, virtual keypress)
  const gameCanvasRef = useRef<{
    handleKeyPress: (key: string) => void;
    restartGame: () => void;
  } | null>(null);

  // Guard against duplicate score submission
  const hasSubmittedScoreRef = useRef(false);

  // Apply initial audio settings
  useEffect(() => {
    audioManager.updateSettings(audioSettings);
  }, [audioSettings]);

  // Global browser shortcut blocker for space and tab during game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'PLAYING') {
        if (e.key === ' ' && e.target === document.body) {
          e.preventDefault();
        }
        if (e.key === 'Escape') {
          setGameState('PAUSED');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Pause game when browser tab becomes inactive (visibilitychange)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameState === 'PLAYING') {
        setGameState('PAUSED');
        audioManager.stopMusic();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameState]);

  // Handle Audio Settings Updates
  const handleUpdateAudioSettings = (newSettings: Partial<AudioSettings>) => {
    const updated = { ...audioSettings, ...newSettings };
    setAudioSettings(updated);
    audioManager.updateSettings(updated);
    storageService.saveAudioSettings(updated);
  };

  const handleToggleMute = () => {
    handleUpdateAudioSettings({ isMuted: !audioSettings.isMuted });
  };

  const tutorialStartsRun = useRef(false);

  // State Transition Handlers
  const handleStartGame = () => {
    // Check if first-time player tutorial needed
    const hasViewedTutorial = localStorage.getItem('skillence_tutorial_viewed');
    if (!hasViewedTutorial) {
      tutorialStartsRun.current = true;
      localStorage.setItem('skillence_tutorial_viewed', 'true');
      setIsHowToPlayOpen(true);
      return;
    }

    launchRun();
  };

  const launchRun = () => {
    audioManager.init();
    hasSubmittedScoreRef.current = false;
    setStats(INITIAL_STATS);
    setActiveWord(INITIAL_WORD_STATE);
    setIsNewRecord(false);
    setGameState('PLAYING');
  };

  const handlePause = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
    }
  };

  const handleResume = () => {
    if (gameState === 'PAUSED') {
      setGameState('PLAYING');
    }
  };

  const handleRestart = () => {
    hasSubmittedScoreRef.current = false;
    setStats(INITIAL_STATS);
    setActiveWord(INITIAL_WORD_STATE);
    setIsNewRecord(false);
    setGameState('PLAYING');
    if (gameCanvasRef.current) {
      gameCanvasRef.current.restartGame();
    }
  };

  const handleMainMenu = () => {
    audioManager.stopMusic();
    setGameState('MENU');
  };

  const handleGameOver = useCallback((finalStats: GameStats) => {
    setStats(finalStats);
    setGameState('GAMEOVER');
    audioManager.stopMusic();

    // Prevent duplicate score submissions
    if (hasSubmittedScoreRef.current) return;
    hasSubmittedScoreRef.current = true;

    const currentBestScore = profile.highScore;
    const isNewBest = finalStats.score > currentBestScore;
    setIsNewRecord(isNewBest);

    // Update player profile in localStorage
    const updatedProfile = storageService.updateBestStats(
      finalStats.score,
      finalStats.peakWPM,
      finalStats.coinsCollected
    );
    setProfile(updatedProfile);

    // Validate and save to leaderboard
    if (finalStats.score > 0 && finalStats.wordsCompleted > 0) {
      leaderboardService.addEntry({
        name: profile.name,
        isStudent: profile.isStudent,
        highestWPM: finalStats.peakWPM,
        score: finalStats.score,
        distance: finalStats.distance,
        category: 'daily',
      });
    }
  }, [profile]);

  return (
    <div className="w-full min-h-screen bg-[#080f0a] text-stone-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* 1. Main Home Screen */}
      {gameState === 'MENU' && (
        <HomeScreen
          profile={profile}
          isMuted={audioSettings.isMuted}
          onStartGame={handleStartGame}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 2. In-Game View (Canvas + HUD + Mobile Keyboard) */}
      {gameState !== 'MENU' && (
        <div className="relative w-full h-dvh flex flex-col items-center justify-center bg-black overflow-hidden">
          {/* HUD Overlay */}
          <HUD
            stats={stats}
            activeWord={activeWord}
            profile={profile}
            isMuted={audioSettings.isMuted}
            onToggleMute={handleToggleMute}
            onPause={handlePause}
          />

          {/* Phaser 3 16:9 Canvas */}
          <Suspense fallback={<div className="text-amber-300" role="status">Loading SkillRush…</div>}>
          <GameCanvas
            callbacks={{
              onStatsUpdate: (s) => setStats(s),
              onActiveWordUpdate: (w) => setActiveWord(w),
              onGameOver: handleGameOver,
            }}
            isPaused={gameState === 'PAUSED'}
            gameRef={gameCanvasRef}
          />

          </Suspense>

          {/* Mobile Auto-Focus & Touch Keyboard */}
          <MobileKeyboard
            isActive={gameState === 'PLAYING'}
            onKeyPress={(key) => {
              if (gameCanvasRef.current) {
                gameCanvasRef.current.handleKeyPress(key);
              }
            }}
          />

          {/* Pause Modal Overlay */}
          <PauseModal
            isOpen={gameState === 'PAUSED'}
            isMuted={audioSettings.isMuted}
            onResume={handleResume}
            onRestart={handleRestart}
            onMainMenu={handleMainMenu}
            onToggleMute={handleToggleMute}
          />

          {/* Game Over Modal Overlay */}
          <GameOverModal
            isOpen={gameState === 'GAMEOVER'}
            stats={stats}
            profile={profile}
            isNewRecord={isNewRecord}
            onPlayAgain={handleRestart}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onMainMenu={handleMainMenu}
          />
        </div>
      )}

      {/* Global Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        currentProfile={profile}
        onClose={() => setIsLoginOpen(false)}
        onSaveProfile={(newProf) => {
          setProfile(newProf);
          storageService.saveProfile(newProf);
        }}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => {
          setIsHowToPlayOpen(false);
          if (tutorialStartsRun.current && gameState === 'MENU') {
            tutorialStartsRun.current = false;
            launchRun();
          }
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={audioSettings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateAudioSettings}
      />
    </div>
  );
}

export default App;
