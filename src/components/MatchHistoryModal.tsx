import React from 'react';
import { X, Trophy, Trash2, Calendar, Clock, Share2, Copy } from 'lucide-react';
import { CompletedMatch } from '../types/scoreboard';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: CompletedMatch[];
  onDeleteMatch: (id: string) => void;
  onClearHistory: () => void;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  matches,
  onDeleteMatch,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const getSportBadge = (sport: string) => {
    switch (sport) {
      case 'volleyball_indoor':
        return { label: 'Vôlei Quadra', icon: '🏐' };
      case 'volleyball_beach':
        return { label: 'Vôlei Praia', icon: '🏖️' };
      case 'beach_tennis':
        return { label: 'Beach Tennis', icon: '🎾' };
      case 'badminton':
        return { label: 'Badminton', icon: '🏸' };
      default:
        return { label: 'Esporte', icon: '🏆' };
    }
  };

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    return `${mins} min`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl my-8 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h3 className="text-xl font-bold text-white">Histórico de Partidas</h3>
            <p className="text-xs text-neutral-400">Jogos salvos localmente neste dispositivo</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matches List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {matches.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Nenhuma partida salva ainda.</p>
              <p className="text-xs mt-1">Ao finalizar um jogo, clique em "Salvar no Histórico".</p>
            </div>
          ) : (
            matches.map((m) => {
              const sportInfo = getSportBadge(m.sport);
              const winnerTeam = m.winner === 'teamA' ? m.teamA : m.teamB;

              return (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <span>{sportInfo.icon}</span>
                      <span>{sportInfo.label}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-neutral-500">{m.date}</span>
                      <button
                        onClick={() => onDeleteMatch(m.id)}
                        className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                        title="Excluir partida do histórico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm font-bold text-white mb-2">
                    <span>{m.teamA.name}</span>
                    <span className="font-mono text-base bg-neutral-900 px-3 py-0.5 rounded-lg border border-neutral-800">
                      {m.finalSets.teamA} x {m.finalSets.teamB}
                    </span>
                    <span>{m.teamB.name}</span>
                  </div>

                  <div className="text-xs text-neutral-400 flex items-center justify-between pt-2 border-t border-neutral-900">
                    <span className="text-emerald-400 font-medium truncate max-w-[200px]">
                      🏆 Vencedor: {winnerTeam.name}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {formatDuration(m.totalDurationSeconds)}
                    </span>
                  </div>

                  {m.setDetails && m.setDetails.length > 0 && (
                    <div className="mt-2 text-[11px] text-neutral-400 font-mono bg-neutral-900/50 p-1.5 rounded">
                      {m.setDetails.join(' | ')}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {matches.length > 0 && (
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Todo o Histórico</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
