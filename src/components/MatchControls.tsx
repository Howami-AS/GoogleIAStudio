import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  ArrowLeftRight,
  Volume2,
  Bell,
  Clock,
  RotateCcw,
  FileText,
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface MatchControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSwapSides: () => void;
  onRequestTimeout: () => void;
  onResetMatch: () => void;
  onOpenSummary: () => void;
  isMatchOver: boolean;
  isArenaMode?: boolean;
}

export const MatchControls: React.FC<MatchControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSwapSides,
  onRequestTimeout,
  onResetMatch,
  onOpenSummary,
  isMatchOver,
  isArenaMode = false,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <footer className="w-full max-w-5xl mx-auto px-2 sm:px-3 py-1 sm:py-1.5 flex flex-wrap items-center justify-between gap-1 sm:gap-2 select-none shrink-0">
        {/* Undo and Redo cluster */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-neutral-900/90 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-neutral-800">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-25 disabled:pointer-events-none transition-all active:scale-95"
            title="Desfazer último ponto (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Desfazer</span>
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg sm:rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-25 disabled:pointer-events-none transition-all active:scale-95"
            title="Refazer ponto desfeito"
          >
            <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Center: Swap Sides & Timeout */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={onSwapSides}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
            title="Inverter lados da quadra"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xs:inline sm:inline">Trocar Lado</span>
          </button>

          <button
            onClick={onRequestTimeout}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-amber-400 text-xs font-bold transition-all active:scale-95 shadow-sm"
            title="Abrir contagem de Tempo Técnico (30s)"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Tempo (30s)</span>
          </button>
        </div>

        {/* Referee audio cues (Whistle / Buzzer) */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-neutral-900/90 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-neutral-800">
          <button
            onClick={() => soundManager.playWhistle(true)}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-neutral-300 hover:text-amber-400 hover:bg-neutral-800 transition-all active:scale-95"
            title="Apito de Árbitro"
          >
            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={() => soundManager.playBuzzer()}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-neutral-300 hover:text-rose-400 hover:bg-neutral-800 transition-all active:scale-95"
            title="Buzina de Ginásio"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Match Súmula / Reset Match */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSummary}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-semibold transition-all active:scale-95"
            title="Visualizar súmula e estatísticas da partida"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Súmula</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-red-900/60 text-neutral-400 hover:text-red-400 transition-all active:scale-95"
            title="Zerar / Nova Partida"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </footer>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Zerar Placar Atual?</h4>
            <p className="text-xs text-neutral-400 mb-6">
              Todos os pontos do jogo atual serão zerados. Deseja reiniciar a contagem?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 text-sm font-semibold hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetMatch();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors shadow-lg"
              >
                Sim, Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
