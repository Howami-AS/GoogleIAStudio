import React, { useState, useEffect } from 'react';
import { X, Trophy, Share2, Copy, Check, RotateCcw, Calendar, Clock, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MatchState, SportRulesConfig, CompletedMatch } from '../types/scoreboard';

interface MatchSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: MatchState;
  config: SportRulesConfig;
  onStartNewMatch: () => void;
  onSaveMatchToHistory: (match: CompletedMatch) => void;
}

export const MatchSummaryModal: React.FC<MatchSummaryModalProps> = ({
  isOpen,
  onClose,
  state,
  config,
  onStartNewMatch,
  onSaveMatchToHistory,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Trigger confetti when modal opens if match is won
  useEffect(() => {
    if (isOpen && state.isMatchOver) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#ec4899'],
      });
    }
  }, [isOpen, state.isMatchOver]);

  if (!isOpen) return null;

  const winner = state.matchWinner ? state[state.matchWinner] : null;
  const isTeamAWinner = state.matchWinner === 'teamA';

  const formatSportName = (sport: string) => {
    switch (sport) {
      case 'volleyball_indoor':
        return 'Vôlei de Quadra';
      case 'volleyball_beach':
        return 'Vôlei de Praia';
      case 'beach_tennis':
        return 'Beach Tennis';
      case 'badminton':
        return 'Badminton';
      default:
        return 'Placar Esportivo';
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  // Compile set lines
  const setLines: string[] = [];
  state.setHistory.forEach((s, idx) => {
    setLines.push(`Set ${idx + 1}: ${s.teamA} x ${s.teamB}`);
  });
  if (!state.isMatchOver && (state.scoreA > 0 || state.scoreB > 0 || state.gamesA > 0 || state.gamesB > 0)) {
    const currStr =
      state.sport === 'beach_tennis'
        ? `Set ${state.currentSetIndex + 1} (em andamento): ${state.gamesA} x ${state.gamesB}`
        : `Set ${state.currentSetIndex + 1} (em andamento): ${state.scoreA} x ${state.scoreB}`;
    setLines.push(currStr);
  }

  // Generate shareable text
  const generateShareText = () => {
    const trophyLine = winner
      ? `🏆 VENCEDOR: ${winner.name} ${winner.players ? `(${winner.players})` : ''}`
      : '📊 PLACAR PARCIAL';

    const setsSummary =
      state.sport === 'beach_tennis' && config.beachTennisFormat !== 'best_of_3'
        ? `Games: ${state.gamesA} x ${state.gamesB}`
        : `Sets: ${state.setsWonA} x ${state.setsWonB}`;

    const text = `
🏸🏐🎾 SÚMULA - ${formatSportName(state.sport).toUpperCase()}
${state.teamA.name} ${state.setsWonA} x ${state.setsWonB} ${state.teamB.name}
${trophyLine}
${setsSummary}
-------------------------
${setLines.join('\n')}
-------------------------
⏱️ Tempo de Jogo: ${formatTime(state.elapsedSeconds)}
Marcado via Scoreboard Pro
`.trim();

    return text;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSaveToHistory = () => {
    if (!state.matchWinner) return;

    const completed: CompletedMatch = {
      id: `${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      sport: state.sport,
      teamA: { name: state.teamA.name, players: state.teamA.players },
      teamB: { name: state.teamB.name, players: state.teamB.players },
      winner: state.matchWinner,
      finalSets: { teamA: state.setsWonA, teamB: state.setsWonB },
      setDetails: setLines,
      totalDurationSeconds: state.elapsedSeconds,
    };

    onSaveMatchToHistory(completed);
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Winner Hero Banner */}
        <div className="text-center mb-6">
          {winner ? (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-400/20 text-amber-400 mb-3 border border-amber-400/40 shadow-lg">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-neutral-800 text-neutral-300 mb-3 border border-neutral-700">
              <Award className="w-8 h-8" />
            </div>
          )}

          <div className="text-xs uppercase font-bold text-amber-400 tracking-wider">
            {formatSportName(state.sport)}
          </div>
          <h3 className="text-2xl font-black text-white mt-1">
            {winner ? `Vitória de ${winner.name}!` : 'Súmula da Partida'}
          </h3>
          {winner?.players && (
            <p className="text-xs text-neutral-400 font-medium mt-0.5">{winner.players}</p>
          )}
        </div>

        {/* Score Card Banner */}
        <div className="bg-neutral-950/80 rounded-2xl p-4 border border-neutral-800 mb-5">
          <div className="flex items-center justify-between gap-4">
            {/* Team A */}
            <div className="flex-1 text-center">
              <div
                className="w-3 h-3 rounded-full mx-auto mb-1.5"
                style={{ backgroundColor: state.teamA.color }}
              />
              <span className="font-bold text-sm text-white block truncate">{state.teamA.name}</span>
              <span className="text-4xl font-black font-mono text-white mt-1 block">
                {state.sport === 'beach_tennis' && config.beachTennisFormat !== 'best_of_3'
                  ? state.gamesA
                  : state.setsWonA}
              </span>
            </div>

            <div className="text-xs font-bold text-neutral-500 uppercase">VS</div>

            {/* Team B */}
            <div className="flex-1 text-center">
              <div
                className="w-3 h-3 rounded-full mx-auto mb-1.5"
                style={{ backgroundColor: state.teamB.color }}
              />
              <span className="font-bold text-sm text-white block truncate">{state.teamB.name}</span>
              <span className="text-4xl font-black font-mono text-white mt-1 block">
                {state.sport === 'beach_tennis' && config.beachTennisFormat !== 'best_of_3'
                  ? state.gamesB
                  : state.setsWonB}
              </span>
            </div>
          </div>

          {/* Sets Breakdown List */}
          {setLines.length > 0 && (
            <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-1.5">
              <span className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider block mb-1">
                Detalhamento dos Sets:
              </span>
              {setLines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-neutral-900/60 text-neutral-300 font-mono"
                >
                  <span>{line}</span>
                </div>
              ))}
            </div>
          )}

          {/* Duration info */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Tempo de jogo: {formatTime(state.elapsedSeconds)}</span>
          </div>
        </div>

        {/* Share & Copy Actions */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors border border-neutral-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Súmula'}</span>
          </button>
        </div>

        {/* Save to history button */}
        {state.isMatchOver && (
          <button
            onClick={handleSaveToHistory}
            disabled={saved}
            className={`w-full py-2.5 mb-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              saved
                ? 'bg-neutral-800 border-neutral-700 text-emerald-400 cursor-default'
                : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
            <span>{saved ? 'Salvo no Histórico' : 'Salvar no Histórico Local'}</span>
          </button>
        )}

        {/* Start new match */}
        <button
          onClick={() => {
            onClose();
            onStartNewMatch();
          }}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Iniciar Nova Partida</span>
        </button>
      </div>
    </div>
  );
};
