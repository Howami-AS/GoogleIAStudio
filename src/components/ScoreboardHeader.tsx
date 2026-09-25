import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Settings,
  History,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Smartphone,
  Tv,
} from 'lucide-react';
import { SportType } from '../types/scoreboard';
import { requestLandscapeMode } from '../utils/orientation';
import { PWAInstallButton } from './PWAInstallButton';

interface ScoreboardHeaderProps {
  currentSport: SportType;
  onSelectSport: (sport: SportType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  isArenaMode: boolean;
  onToggleArenaMode: () => void;
}

export const ScoreboardHeader: React.FC<ScoreboardHeaderProps> = ({
  currentSport,
  onSelectSport,
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  elapsedSeconds,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  onOpenSettings,
  onOpenHistory,
  isArenaMode,
  onToggleArenaMode,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<unknown>(null);

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await requestLandscapeMode();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback
    }
  };

  // Screen Wake Lock API
  const toggleWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        if (!wakeLockActive) {
          const sentinel = await (
            navigator as unknown as { wakeLock: { request: (type: string) => Promise<unknown> } }
          ).wakeLock.request('screen');
          setWakeLockSentinel(sentinel);
          setWakeLockActive(true);
        } else {
          if (
            wakeLockSentinel &&
            typeof (wakeLockSentinel as { release: () => Promise<void> }).release === 'function'
          ) {
            await (wakeLockSentinel as { release: () => Promise<void> }).release();
          }
          setWakeLockSentinel(null);
          setWakeLockActive(false);
        }
      } catch {
        setWakeLockActive(false);
      }
    }
  };

  // Format MM:SS or HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sportsList: { id: SportType; label: string; icon: string }[] = [
    { id: 'volleyball_indoor', label: 'Vôlei Quadra', icon: '🏐' },
    { id: 'volleyball_beach', label: 'Vôlei Praia', icon: '🏖️' },
    { id: 'beach_tennis', label: 'Beach Tennis', icon: '🎾' },
    { id: 'badminton', label: 'Badminton', icon: '🏸' },
  ];

  return (
    <header className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-1.5 select-none shrink-0">
      {/* Sport Selector Tabs */}
      <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl sm:rounded-2xl border border-neutral-800/80 overflow-x-auto max-w-full">
        {sportsList.map((sport) => {
          const isActive = currentSport === sport.id;
          return (
            <button
              key={sport.id}
              onClick={() => onSelectSport(sport.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <span className="text-sm">{sport.icon}</span>
              <span className="hidden xs:inline sm:inline">{sport.label}</span>
            </button>
          );
        })}
      </div>

      {/* Match Stopwatch & Action Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Match Timer */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-neutral-900/90 px-2 sm:px-3 py-1 rounded-xl sm:rounded-2xl border border-neutral-800/80">
          <button
            onClick={onToggleTimer}
            className={`p-1 rounded-lg transition-colors ${
              isTimerRunning ? 'text-amber-400 hover:text-amber-300' : 'text-neutral-400 hover:text-white'
            }`}
            title={isTimerRunning ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <span className="font-mono text-xs sm:text-sm font-bold text-neutral-100 min-w-[46px] sm:min-w-[54px] text-center tracking-wider">
            {formatTime(elapsedSeconds)}
          </span>
          <button
            onClick={onResetTimer}
            className="p-1 text-neutral-500 hover:text-neutral-300 rounded transition-colors"
            title="Zerar cronômetro"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Arena / Telão Gigante Mode Toggle */}
        <button
          onClick={onToggleArenaMode}
          className={`flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold border transition-all ${
            isArenaMode
              ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:text-white'
          }`}
          title={isArenaMode ? 'Desativar Telão Gigante' : 'Ativar Modo Telão Gigante (visível de longe)'}
        >
          <Tv className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Telão</span>
        </button>

        {/* Force Horizontal / Landscape on Android */}
        <button
          onClick={() => requestLandscapeMode()}
          className="flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold bg-neutral-900 border border-neutral-800 text-sky-400 hover:text-sky-300 hover:bg-neutral-800/80 transition-all shadow-sm"
          title="Forçar Modo Horizontal / Girar Tela (Android e Celular)"
        >
          <Smartphone className="w-3.5 h-3.5 rotate-90" />
          <span className="hidden sm:inline">Horizontal</span>
        </button>

        {/* Voice Announcer Toggle */}
        <button
          onClick={onToggleVoice}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            voiceEnabled
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
          title={voiceEnabled ? 'Voz ativada' : 'Ativar locutor de voz'}
        >
          {voiceEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">Voz</span>
        </button>

        {/* Sound Effects Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
            soundEnabled
              ? 'bg-neutral-900 border-neutral-700 text-neutral-200'
              : 'bg-neutral-900 border-neutral-800 text-neutral-500'
          }`}
          title={soundEnabled ? 'Sons ativados' : 'Sons mudos'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>

        {/* Wake Lock */}
        {'wakeLock' in navigator && (
          <button
            onClick={toggleWakeLock}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
              wakeLockActive
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
            }`}
            title={wakeLockActive ? 'Tela sempre ativa: Ligado' : 'Manter tela sempre acesa'}
          >
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}

        {/* Fullscreen Toggle */}
        <button
          onClick={handleToggleFullscreen}
          className="p-1.5 sm:p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia horizontal'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>

        {/* Match History */}
        <button
          onClick={onOpenHistory}
          className="p-1.5 sm:p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          title="Histórico de Partidas"
        >
          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Match Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          title="Configurações da Partida e Regras"
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </header>
  );
};
