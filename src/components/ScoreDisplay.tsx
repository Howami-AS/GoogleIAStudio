import React from 'react';
import { Minus, Plus, Clock, Trophy, Flame } from 'lucide-react';
import { MatchState, SportRulesConfig, Team } from '../types/scoreboard';
import { formatBeachTennisPoint } from '../utils/rules';

interface ScoreDisplayProps {
  state: MatchState;
  config: SportRulesConfig;
  isArenaMode?: boolean;
  onAddPoint: (team: 'teamA' | 'teamB') => void;
  onSubtractPoint: (team: 'teamA' | 'teamB') => void;
  onToggleServer: (team: 'teamA' | 'teamB') => void;
  onRequestTimeout: (teamId: 'teamA' | 'teamB', teamName: string) => void;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  state,
  config,
  isArenaMode = false,
  onAddPoint,
  onSubtractPoint,
  onToggleServer,
  onRequestTimeout,
}) => {
  // Determine left and right team based on swapped sides
  const leftId: 'teamA' | 'teamB' = state.isSwappedSides ? 'teamB' : 'teamA';
  const rightId: 'teamA' | 'teamB' = state.isSwappedSides ? 'teamA' : 'teamB';

  const renderTeamPanel = (teamId: 'teamA' | 'teamB', isLeft: boolean) => {
    const team: Team = state[teamId];
    const isServing = state.server === teamId;
    const scoreVal = teamId === 'teamA' ? state.scoreA : state.scoreB;
    const gamesVal = teamId === 'teamA' ? state.gamesA : state.gamesB;
    const setsWon = teamId === 'teamA' ? state.setsWonA : state.setsWonB;
    const timeoutsLeft = teamId === 'teamA' ? state.timeoutsA : state.timeoutsB;

    const isBeachTennis = state.sport === 'beach_tennis';
    const displayPoint = isBeachTennis
      ? formatBeachTennisPoint(scoreVal, state.isTiebreak)
      : scoreVal.toString();

    const serveIcon =
      state.sport === 'badminton'
        ? '🏸'
        : state.sport === 'beach_tennis'
        ? '🎾'
        : '🏐';

    return (
      <div
        className={`relative flex-1 flex flex-col justify-between rounded-2xl md:rounded-3xl border transition-all duration-200 overflow-hidden shadow-2xl select-none ${
          isServing
            ? 'border-amber-400/50 bg-gradient-to-b from-neutral-900 via-neutral-900/95 to-neutral-950 ring-2 ring-amber-400/40'
            : 'border-neutral-800 bg-neutral-950/85'
        }`}
        style={{
          boxShadow: isServing
            ? `0 0 35px -5px ${team.color}40, inset 0 0 20px -10px ${team.color}20`
            : undefined,
        }}
      >
        {/* Top colored accent line */}
        <div
          className="h-1.5 md:h-2 w-full shrink-0 transition-all duration-300"
          style={{ backgroundColor: team.color }}
        />

        {/* Panel Header: Team name, Serve Indicator, Sets & Games */}
        <div className="px-3 py-1.5 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2 border-b border-neutral-800/80 bg-neutral-900/40 shrink-0">
          {/* Team Name & Players */}
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <span
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: team.color }}
            />
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl md:text-2xl font-black text-white truncate tracking-tight uppercase">
                {team.name}
              </h2>
              {team.players && (
                <p className="text-[10px] sm:text-xs text-neutral-400 truncate font-semibold">
                  {team.players}
                </p>
              )}
            </div>
          </div>

          {/* Sets and Games Badges */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Sets Dots */}
            <div className="flex items-center gap-1 bg-neutral-950/80 px-2 py-1 rounded-xl border border-neutral-800">
              <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase mr-0.5">
                Sets
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: config.setsToWin }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded transition-all ${
                      i < setsWon
                        ? 'bg-emerald-400 border border-emerald-300 shadow-md shadow-emerald-500/50 scale-110'
                        : 'bg-neutral-800 border border-neutral-700'
                    }`}
                    title={`Set ${i + 1} vencido`}
                  />
                ))}
              </div>
            </div>

            {/* Beach Tennis Games Counter */}
            {isBeachTennis && (
              <div className="flex items-center gap-1 bg-neutral-950/80 px-2.5 py-1 rounded-xl border border-amber-500/30">
                <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase">
                  Games
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-white leading-none">
                  {gamesVal}
                </span>
              </div>
            )}

            {/* Serve Button / Indicator */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleServer(teamId);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow ${
                isServing
                  ? 'bg-amber-400 text-neutral-950 ring-2 ring-amber-300 shadow-amber-400/40 animate-pulse'
                  : 'bg-neutral-800/90 text-neutral-400 hover:text-white border border-neutral-700'
              }`}
              title="Alternar posse de saque"
            >
              <span>{serveIcon}</span>
              <span className="text-[11px] sm:text-xs uppercase tracking-wide">
                {isServing ? 'SAQUE' : 'Saque'}
              </span>
            </button>
          </div>
        </div>

        {/* GIANT SCORE TAP AREA: Maximized for Distance Visibility */}
        <div
          onClick={() => {
            if (!state.isMatchOver) {
              onAddPoint(teamId);
            }
          }}
          className={`flex-1 flex flex-col items-center justify-center relative cursor-pointer group active:scale-[0.99] transition-transform ${
            state.isMatchOver ? 'opacity-85 cursor-default' : 'hover:bg-white/[0.015]'
          }`}
          title="Toque na tela para adicionar ponto"
        >
          {/* Subtle click guide */}
          <span className="absolute top-1 text-[10px] sm:text-xs text-neutral-500 opacity-40 group-hover:opacity-100 transition-opacity font-medium pointer-events-none">
            Toque para +1
          </span>

          {/* MONUMENTAL SCORE DIGITS */}
          <div className="relative flex items-center justify-center w-full px-2">
            <span
              className="font-black font-mono tracking-tighter transition-all duration-100 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] leading-none select-none text-center"
              style={{
                fontSize: 'clamp(5.5rem, 36vh, 26vw)',
                color: scoreVal > 0 ? '#FFFFFF' : '#666666',
                fontFamily: "'Chakra Petch', 'JetBrains Mono', monospace",
                textShadow: isServing
                  ? `0 0 35px ${team.color}50, 0 4px 12px rgba(0,0,0,0.9)`
                  : '0 4px 14px rgba(0,0,0,0.9)',
              }}
            >
              {displayPoint}
            </span>

            {/* Tiebreak badge */}
            {isBeachTennis && state.isTiebreak && (
              <span className="absolute -bottom-2 sm:bottom-0 px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold rounded-lg uppercase tracking-wider shadow">
                Tie-break
              </span>
            )}
          </div>
        </div>

        {/* Bottom Incremental Controls Bar */}
        <div className="px-2 py-1.5 sm:px-3 sm:py-2.5 bg-neutral-900/70 border-t border-neutral-800/80 flex items-center justify-between gap-2 shrink-0">
          {/* Minus button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSubtractPoint(teamId);
            }}
            disabled={scoreVal === 0 || state.isMatchOver}
            className="flex-1 py-2 sm:py-3 flex items-center justify-center rounded-xl sm:rounded-2xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-25 disabled:pointer-events-none transition-all active:scale-95 border border-neutral-700/60"
            aria-label={`Subtrair ponto de ${team.name}`}
            title="Subtrair ponto (-1)"
          >
            <Minus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>

          {/* Plus button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddPoint(teamId);
            }}
            disabled={state.isMatchOver}
            className="flex-[2] py-2 sm:py-3 flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl text-neutral-950 font-black text-sm sm:text-base transition-all active:scale-95 shadow-lg disabled:opacity-30 disabled:pointer-events-none"
            style={{
              backgroundColor: team.color,
              color: '#0a0a0a',
            }}
            aria-label={`Adicionar ponto para ${team.name}`}
            title="Adicionar ponto (+1)"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
              +1 Ponto
            </span>
          </button>

          {/* Volleyball Timeout request button */}
          {(state.sport === 'volleyball_indoor' || state.sport === 'volleyball_beach') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRequestTimeout(teamId, team.name);
              }}
              disabled={timeoutsLeft <= 0 || state.isMatchOver}
              className="px-2.5 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-neutral-800/80 hover:bg-neutral-800 text-amber-400 disabled:opacity-25 disabled:pointer-events-none border border-neutral-700/60 transition-all flex items-center gap-1"
              title={`Tempo Técnico (${timeoutsLeft} disponíveis)`}
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs font-bold">{timeoutsLeft}</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col landscape:flex-row md:flex-row gap-2 sm:gap-3 px-1 sm:px-2 md:px-4 py-1">
      {renderTeamPanel(leftId, true)}
      {renderTeamPanel(rightId, false)}
    </div>
  );
};
