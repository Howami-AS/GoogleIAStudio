import React from 'react';
import { ArrowLeftRight, AlertTriangle, Sparkles, Trophy } from 'lucide-react';
import { MatchState, SportRulesConfig } from '../types/scoreboard';
import { getCriticalPointNotice, checkSideSwapNeeded } from '../utils/rules';

interface SportRuleNoticeProps {
  state: MatchState;
  config: SportRulesConfig;
  onSwapSides: () => void;
}

export const SportRuleNotice: React.FC<SportRuleNoticeProps> = ({
  state,
  config,
  onSwapSides,
}) => {
  const critical = getCriticalPointNotice(state, config);
  const sideSwap = checkSideSwapNeeded(state, config);

  const leadingTeam = critical.team ? state[critical.team] : null;

  if (!sideSwap.needed && !critical.type && state.sport !== 'badminton') {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-0.5 sm:py-1 flex flex-col gap-1 shrink-0">
      {/* Side Swap Reminder Alert */}
      {sideSwap.needed && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 animate-pulse shadow-md">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold truncate">
            <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span className="truncate">{sideSwap.reason}</span>
          </div>
          <button
            onClick={onSwapSides}
            className="px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold bg-amber-500 text-neutral-950 rounded-lg hover:bg-amber-400 transition-colors shrink-0 shadow"
          >
            Trocar Agora
          </button>
        </div>
      )}

      {/* Critical Points: Match Point, Set Point, Golden Point */}
      {critical.type && (
        <div
          className={`flex items-center justify-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-extrabold tracking-wide uppercase shadow-md transition-all ${
            critical.type === 'match_point'
              ? 'bg-rose-600/25 border-rose-500/60 text-rose-300 animate-pulse'
              : critical.type === 'set_point'
              ? 'bg-indigo-600/25 border-indigo-500/60 text-indigo-300'
              : critical.type === 'golden_point'
              ? 'bg-amber-500/25 border-amber-400/70 text-amber-300 ring-2 ring-amber-400/40 animate-pulse'
              : 'bg-neutral-800/80 border-neutral-700 text-neutral-300'
          }`}
        >
          {critical.type === 'match_point' && <Trophy className="w-3.5 h-3.5 text-rose-400 animate-bounce" />}
          {critical.type === 'set_point' && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
          {critical.type === 'golden_point' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}

          <span className="truncate">
            {critical.message}
            {leadingTeam && ` - ${leadingTeam.name}`}
          </span>
        </div>
      )}

      {/* Badminton Service Court indicator (only if not critical) */}
      {state.sport === 'badminton' && !critical.type && !sideSwap.needed && (
        <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs text-neutral-400 font-medium py-0.5">
          <span>
            Saque:{' '}
            <strong className="text-emerald-400">{state[state.server].name}</strong>
          </span>
          <span className="text-neutral-600">•</span>
          <span>
            Lado:{' '}
            <strong className="text-white">
              {((state.server === 'teamA' ? state.scoreA : state.scoreB) % 2 === 0)
                ? 'Direita (Par)'
                : 'Esquerda (Ímpar)'}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
};
