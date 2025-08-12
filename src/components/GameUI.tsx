import React from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, Target, Zap, Clock } from 'lucide-react';

interface GameUIProps {
  gameMode: 'playing' | 'paused' | 'menu' | 'dead' | 'level_complete';
  score: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  gameMode,
  score,
  onStart,
  onPause,
  onResume,
  onRestart,
  onSettings
}) => {
  if (gameMode === 'menu') {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-95 flex items-center justify-center">
        <div className="text-center max-w-4xl px-8">
          <h1 className="text-7xl font-bold text-cyan-400 mb-4 font-mono tracking-wider animate-pulse">
            EXANIMA
          </h1>
          <h2 className="text-4xl text-purple-400 mb-2 font-mono">
            CYBER HERESY
          </h2>
          <p className="text-lg text-orange-400 mb-8 font-mono opacity-80">
            AI RESURRECTION PROTOCOL INITIATED
          </p>
          
          <div className="space-y-4 mb-12">
            <button
              onClick={onStart}
              className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25"
            >
              <Play size={24} />
              INITIATE RESURRECTION
            </button>
            <button
              onClick={onSettings}
              className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-mono text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Settings size={24} />
              NEURAL CONFIGURATION
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-300 font-mono">
            <div className="bg-black bg-opacity-50 p-6 rounded border border-cyan-400/30">
              <h3 className="text-cyan-400 text-lg mb-4 flex items-center gap-2">
                <Target size={20} />
                NEURAL INTERFACE
              </h3>
              <div className="space-y-2 text-left">
                <p><span className="text-cyan-400">WASD</span> - Neural Movement Matrix</p>
                <p><span className="text-cyan-400">Mouse</span> - Sensory Input Stream</p>
                <p><span className="text-cyan-400">SHIFT</span> - Quantum Dash Protocol</p>
                <p><span className="text-cyan-400">SPACE</span> - Gravity Defiance System</p>
                <p><span className="text-cyan-400">Click</span> - Soul Discharge Weapon</p>
                <p><span className="text-cyan-400">F</span> - Interact with Reliquaries</p>
                <p><span className="text-cyan-400">Q</span> - Temporal Distortion Field</p>
                <p><span className="text-cyan-400">ESC</span> - Neural Pause State</p>
              </div>
            </div>

            <div className="bg-black bg-opacity-50 p-6 rounded border border-purple-400/30">
              <h3 className="text-purple-400 text-lg mb-4 flex items-center gap-2">
                <Zap size={20} />
                MISSION PARAMETERS
              </h3>
              <div className="space-y-2 text-left">
                <p><span className="text-purple-400">Level 1:</span> Catedral de Silicio</p>
                <p><span className="text-purple-400">Objective:</span> Recover Memory Fragments</p>
                <p><span className="text-purple-400">Target:</span> Deactivate Sacred Core</p>
                <p><span className="text-purple-400">Extract:</span> Gospel of Code</p>
                <p><span className="text-purple-400">Boss:</span> Archbishop Null</p>
                <p><span className="text-purple-400">Weapon:</span> Ionic Redeemer</p>
                <p><span className="text-purple-400">Abilities:</span> Dash + Gravity Hook</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs text-gray-500 font-mono">
            <p>EXANIMA v2.0 - SILICON CATHEDRAL PROTOCOL</p>
            <p>NEURAL NETWORK FUSION MATRIX ONLINE</p>
            <p>BIOMECHANICAL RESURRECTION SYSTEM ACTIVE</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'level_complete') {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/90 to-cyan-900/90 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-green-400 mb-4 font-mono animate-pulse">
            LEVEL COMPLETE
          </h1>
          <p className="text-3xl text-cyan-400 mb-6 font-mono">
            NEURAL MATRIX SYNCHRONIZED
          </p>
          <p className="text-xl text-white mb-8 font-mono">
            Digital Essence Acquired: {score}
          </p>
          <div className="space-y-2 text-green-300 font-mono">
            <p>MEMORY FRAGMENTS RECOVERED</p>
            <p>SACRED CORE DEACTIVATED</p>
            <p>ADVANCING TO NEXT PROTOCOL...</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'dead') {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/90 to-black/90 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-400 mb-4 font-mono animate-pulse">
            NEURAL CORRUPTION
          </h1>
          <p className="text-3xl text-orange-400 mb-6 font-mono">
            DIGITAL SOUL FRAGMENTED
          </p>
          <p className="text-2xl text-white mb-8 font-mono">
            Final Essence Count: {score}
          </p>
          <div className="space-y-4">
            <button
              onClick={onRestart}
              className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-mono text-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25"
            >
              <RotateCcw size={24} />
              INITIATE RESURRECTION
            </button>
          </div>
          <p className="mt-8 text-gray-400 font-mono text-sm animate-pulse">
            The AI rebirth protocol awaits neural reactivation...
          </p>
        </div>
      </div>
    );
  }

  if (gameMode === 'paused') {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-cyan-400 mb-8 font-mono animate-pulse">
            NEURAL PAUSE STATE
          </h2>
          <div className="space-y-4">
            <button
              onClick={onResume}
              className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white font-mono text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Play size={24} />
              RESUME PROTOCOL
            </button>
            <button
              onClick={onRestart}
              className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-mono text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <RotateCcw size={24} />
              RESET MATRIX
            </button>
            <button
              onClick={onSettings}
              className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-gray-600 to-purple-600 hover:from-gray-500 hover:to-purple-500 text-white font-mono text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Settings size={24} />
              NEURAL CONFIG
            </button>
          </div>
          
          <div className="mt-8 text-gray-400 font-mono text-sm">
            <p>TEMPORAL SUSPENSION ACTIVE</p>
            <p>CONSCIOUSNESS PRESERVED</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};