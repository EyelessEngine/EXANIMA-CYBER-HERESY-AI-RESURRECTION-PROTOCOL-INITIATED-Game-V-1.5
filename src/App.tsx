import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './engine/GameEngine';
import { GameUI } from './components/GameUI';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameMode, setGameMode] = useState<'playing' | 'paused' | 'menu' | 'dead' | 'level_complete'>('menu');
  const [score, setScore] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [musicVolume, setMusicVolume] = useState(1);
  const [musicMuted, setMusicMuted] = useState(false);
  const [sfxVolume, setSfxVolume] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);

  // Cargar configuración al iniciar
  useEffect(() => {
    const savedConfig = localStorage.getItem('neuralConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (typeof config.musicVolume === 'number') setMusicVolume(config.musicVolume);
        if (typeof config.musicMuted === 'boolean') setMusicMuted(config.musicMuted);
        if (typeof config.sfxVolume === 'number') setSfxVolume(config.sfxVolume);
      } catch {}
    }
  }, []);

  // Guardar configuración al cambiar
  useEffect(() => {
    const config = { musicVolume, musicMuted, sfxVolume };
    localStorage.setItem('neuralConfig', JSON.stringify(config));
  }, [musicVolume, musicMuted, sfxVolume]);

  // Aplicar configuración restaurada al motor de audio
  useEffect(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.setMusicVolume(musicMuted ? 0 : musicVolume);
      gameEngineRef.current.setSfxVolume(sfxVolume);
    }
  }, [musicVolume, musicMuted, sfxVolume]);

  // Controlar la música solo en playing y primer mapa
  useEffect(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.stopMusic(); // Siempre detener primero
      if (
        gameMode === 'playing' &&
        currentLevel === 1 &&
        !musicMuted &&
        musicVolume > 0
      ) {
        gameEngineRef.current.playMusic();
      }
      // Música del menú principal
      else if (
        gameMode === 'menu' &&
        !musicMuted &&
        musicVolume > 0
      ) {
        setTimeout(() => {
          gameEngineRef.current?.stopMusic();
          gameEngineRef.current?.playMenuMusic();
        }, 100);
      } else {
        gameEngineRef.current?.stopMenuMusic();
      }
    }
  }, [gameMode, currentLevel, musicMuted, musicVolume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to full window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize game engine (starts in menu mode)
    const gameEngine = new GameEngine(canvas);
    gameEngineRef.current = gameEngine;

    // Game state update loop
    const updateGameState = () => {
      if (gameEngineRef.current) {
        const gameState = gameEngineRef.current.getGameState();
        setGameMode(gameState.gameMode);
        setScore(gameState.score);
        setCurrentLevel(gameState.currentLevel);
        // Log para depuración
        console.log('[DEBUG] gameMode actual:', gameState.gameMode);
      }
      requestAnimationFrame(updateGameState);
    };

    updateGameState();

    // Handle keyboard events for game control
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR' && gameMode === 'dead') {
        handleRestart();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('keydown', handleKeyDown);
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, []); // Solo se ejecuta una vez al montar

  const handleStart = () => {
    console.log('Start button clicked');
    if (gameEngineRef.current) {
      gameEngineRef.current.stopMenuMusic(); // Detener música del menú inmediatamente
      gameEngineRef.current.start();
    }
    // Solicitar pointer lock al canvas
    if (canvasRef.current) {
      canvasRef.current.requestPointerLock();
    }
  };

  const handlePause = () => {
    // Pause logic handled by ESC key in game engine
  };

  const handleResume = () => {
    // Resume logic handled by ESC key in game engine
  };

  const handleRestart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Destroy old engine and create new one
    if (gameEngineRef.current) {
      gameEngineRef.current.destroy();
    }
    
    const gameEngine = new GameEngine(canvas);
    gameEngineRef.current = gameEngine;
    gameEngine.start();
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    if (gameEngineRef.current) {
      gameEngineRef.current.setMusicVolume(vol);
    }
  };

  const handleMuteMusic = () => {
    setMusicMuted((prev) => {
      const newMuted = !prev;
      if (gameEngineRef.current) {
        gameEngineRef.current.setMusicVolume(newMuted ? 0 : musicVolume);
      }
      return newMuted;
    });
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSfxVolume(vol);
    if (gameEngineRef.current) {
      gameEngineRef.current.setSfxVolume(vol);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-none"
        style={{ imageRendering: 'pixelated' }}
      />
      
      <GameUI
        gameMode={gameMode}
        score={score}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onRestart={handleRestart}
        onSettings={handleSettings}
      />
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-8 shadow-2xl border-2 border-cyan-400 min-w-[320px]">
            <h2 className="text-2xl text-cyan-300 font-mono mb-6">NEURAL CONFIGURATION</h2>
            <label className="block text-cyan-200 font-mono mb-2">Music Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicMuted ? 0 : musicVolume}
              onChange={handleVolumeChange}
              className="w-full accent-cyan-400 mb-4"
              disabled={musicMuted}
            />
            <div className="flex justify-between text-xs text-cyan-400 font-mono mb-4">
              <span>Mute</span>
              <span>Max</span>
            </div>
            <button
              onClick={handleMuteMusic}
              className={`mb-4 px-4 py-2 font-mono rounded transition-all ${musicMuted ? 'bg-cyan-800 text-cyan-300' : 'bg-cyan-600 text-white'} hover:bg-cyan-400`}
            >
              {musicMuted ? 'Unmute Music' : 'Mute Music'}
            </button>
            <label className="block text-cyan-200 font-mono mb-2 mt-2">SFX Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sfxVolume}
              onChange={handleSfxVolumeChange}
              className="w-full accent-cyan-400 mb-4"
            />
            <div className="flex justify-between text-xs text-cyan-400 font-mono mb-4">
              <span>Mute</span>
              <span>Max</span>
            </div>
            <button
              onClick={handleCloseSettings}
              className="mt-2 px-6 py-2 bg-cyan-700 hover:bg-cyan-500 text-white font-mono rounded transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cyberpunk UI Elements - Only show when not in menu */}
      {gameMode !== 'menu' && (
        <>
          <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm opacity-80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>NEURAL LINK ACTIVE</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 text-purple-400 font-mono text-sm opacity-80">
            <div className="flex items-center gap-2">
              <span>SYSTEM STATUS: OPERATIONAL</span>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 text-orange-400 font-mono text-xs opacity-60">
            <p>EXANIMA v1.0 - CYBER HERESY PROTOCOL</p>
            <p>AI RESURRECTION MATRIX ONLINE</p>
          </div>

          {/* Ambient particles overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-30"></div>
            <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-20 animation-delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-orange-400 rounded-full animate-ping opacity-25 animation-delay-2000"></div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;