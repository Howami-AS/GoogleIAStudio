import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TimeoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName?: string;
  defaultSeconds?: number;
}

export const TimeoutModal: React.FC<TimeoutModalProps> = ({
  isOpen,
  onClose,
  teamName,
  defaultSeconds = 30,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(defaultSeconds);
      setIsRunning(true);
      // Play a short referee whistle when timeout starts
      soundManager.playWhistle(true);
    }
  }, [isOpen, defaultSeconds]);

  useEffect(() => {
    if (!isOpen || !isRunning) return;

    if (secondsLeft <= 0) {
      // Long referee whistle when timeout expires!
      soundManager.playWhistle(false);
      setIsRunning(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          soundManager.playWhistle(false);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isRunning, secondsLeft]);

  if (!isOpen) return null;

  const percentage = (secondsLeft / defaultSeconds) * 100;
  const isExpiring = secondsLeft <= 5 && secondsLeft > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/80 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-xs uppercase tracking-wider font-semibold text-amber-400 mb-1">
          Tempo Técnico
        </div>
        <h3 className="text-xl font-bold text-white mb-6">
          {teamName ? `Pedido por: ${teamName}` : 'Tempo Regulamentar'}
        </h3>

        {/* Circular Countdown Display */}
        <div className="relative flex items-center justify-center w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="84"
              className="stroke-neutral-800"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="96"
              cy="96"
              r="84"
              className={`transition-all duration-1000 ease-linear ${
                isExpiring ? 'stroke-red-500' : 'stroke-amber-400'
              }`}
              strokeWidth="12"
              strokeDasharray={527.7}
              strokeDashoffset={527.7 - (527.7 * percentage) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span
              className={`text-6xl font-black tracking-tight font-mono ${
                isExpiring ? 'text-red-400 animate-pulse' : 'text-white'
              }`}
            >
              {secondsLeft}s
            </span>
            <span className="text-xs text-neutral-400 mt-1 uppercase font-medium">
              {secondsLeft === 0 ? 'Tempo Encerrado!' : isRunning ? 'Em andamento' : 'Pausado'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all shadow-lg active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Continuar
              </>
            )}
          </button>
          <button
            onClick={() => {
              setSecondsLeft(defaultSeconds);
              setIsRunning(true);
            }}
            className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
            title="Reiniciar tempo"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => soundManager.playWhistle(false)}
            className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 transition-colors"
            title="Tocar apito"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl border border-neutral-700 text-neutral-300 text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          Retornar ao Jogo
        </button>
      </div>
    </div>
  );
};
