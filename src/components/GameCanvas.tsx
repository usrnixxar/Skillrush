import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PreloadScene } from '../game/scenes/PreloadScene';
import { MainGameScene, SceneCallbacks } from '../game/scenes/MainGameScene';
import { GAME_CONFIG } from '../game/config/GameConfig';

interface GameCanvasProps {
  callbacks: SceneCallbacks;
  isPaused: boolean;
  gameRef?: React.MutableRefObject<{
    handleKeyPress: (key: string) => void;
    restartGame: () => void;
  } | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ callbacks, isPaused, gameRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const phaserInstanceRef = useRef<Phaser.Game | null>(null);
  const mainSceneRef = useRef<MainGameScene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent duplicate Phaser game instances
    if (phaserInstanceRef.current) {
      phaserInstanceRef.current.destroy(true);
      phaserInstanceRef.current = null;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: GAME_CONFIG.CANVAS_WIDTH,
      height: GAME_CONFIG.CANVAS_HEIGHT,
      backgroundColor: '#080f0a',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: GAME_CONFIG.PHYSICS.GRAVITY_Y },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [PreloadScene, MainGameScene],
    };

    const game = new Phaser.Game(config);
    phaserInstanceRef.current = game;

    // Listen for scene ready to wire callbacks
    game.events.once('step', () => {
      const scene = game.scene.getScene('MainGameScene') as MainGameScene;
      if (scene) {
        mainSceneRef.current = scene;
        scene.setCallbacks(callbacks);
      }
    });

    // Provide handle ref for external key input (mobile keyboard)
    if (gameRef) {
      gameRef.current = {
        handleKeyPress: (key: string) => {
          if (mainSceneRef.current) {
            mainSceneRef.current.handleTypingInput(key);
          }
        },
        restartGame: () => {
          if (mainSceneRef.current) {
            mainSceneRef.current.restartGame();
          }
        },
      };
    }

    return () => {
      if (phaserInstanceRef.current) {
        phaserInstanceRef.current.destroy(true);
        phaserInstanceRef.current = null;
      }
      if (gameRef) {
        gameRef.current = null;
      }
    };
  }, []);

  // Update callbacks reference if updated
  useEffect(() => {
    if (mainSceneRef.current) {
      mainSceneRef.current.setCallbacks(callbacks);
    }
  }, [callbacks]);

  // Handle pause / resume
  useEffect(() => {
    if (!mainSceneRef.current) return;
    if (isPaused) {
      mainSceneRef.current.pauseGame();
    } else {
      mainSceneRef.current.resumeGame();
    }
  }, [isPaused]);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-black">
      <div
        ref={containerRef}
        id="phaser-game-container"
        className="w-full max-w-[1280px] aspect-[16/9] shadow-2xl relative"
      />
    </div>
  );
};
