import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SportRulesConfig,
  SportType,
  Team,
  MatchState,
  MatchPointAction,
  CompletedMatch,
  SetScore,
} from './types/scoreboard';
import {
  SPORT_DEFAULTS,
  formatBeachTennisPoint,
  getSetTargetPoints,
  checkSetWinner,
  getCriticalPointNotice,
  getBadmintonServiceCourt,
} from './utils/rules';
import { soundManager } from './utils/audio';
import { announcer } from './utils/speech';
import { ScoreboardHeader } from './components/ScoreboardHeader';
import { ScoreDisplay } from './components/ScoreDisplay';
import { SportRuleNotice } from './components/SportRuleNotice';
import { MatchControls } from './components/MatchControls';
import { TimeoutModal } from './components/TimeoutModal';
import { MatchSettingsModal } from './components/MatchSettingsModal';
import { MatchSummaryModal } from './components/MatchSummaryModal';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { LandscapeBanner } from './components/LandscapeBanner';
import { OfflineIndicator } from './components/OfflineIndicator';

const INITIAL_TEAM_A: Team = {
  id: 'teamA',
  name: 'Equipe 1',
  players: '',
  color: '#3b82f6', // Royal blue
};

const INITIAL_TEAM_B: Team = {
  id: 'teamB',
  name: 'Equipe 2',
  players: '',
  color: '#ef4444', // Red
};

const LOCAL_STORAGE_KEY_MATCHES = 'scoreboard_pro_matches_v1';
const LOCAL_STORAGE_KEY_STATE = 'scoreboard_pro_current_state_v1';
const LOCAL_STORAGE_KEY_CONFIG = 'scoreboard_pro_current_config_v1';

export default function App() {
  // Config state
  const [config, setConfig] = useState<SportRulesConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SPORT_DEFAULTS.volleyball_indoor;
  });

  // Match state
  const [state, setState] = useState<MatchState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STATE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      sport: 'volleyball_indoor',
      teamA: INITIAL_TEAM_A,
      teamB: INITIAL_TEAM_B,
      scoreA: 0,
      scoreB: 0,
      gamesA: 0,
      gamesB: 0,
      setsWonA: 0,
      setsWonB: 0,
      setHistory: [],
      currentSetIndex: 0,
      server: 'teamA',
      servingCourt: 'right',
      isTiebreak: false,
      isMatchOver: false,
      timeoutsA: 2,
      timeoutsB: 2,
      startTime: Date.now(),
      elapsedSeconds: 0,
      isTimerRunning: true,
      isSwappedSides: false,
      history: [],
      redoHistory: [],
    };
  });

  // Sound and voice toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Modals
  const [isTimeoutOpen, setIsTimeoutOpen] = useState(false);
  const [timeoutTeamName, setTimeoutTeamName] = useState<string | undefined>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isArenaMode, setIsArenaMode] = useState(false);

  // Completed matches history
  const [completedMatches, setCompletedMatches] = useState<CompletedMatch[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_MATCHES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Save current state and config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_STATE, JSON.stringify(state));
      localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {}
  }, [state, config]);

  // Sync sound & voice managers
  useEffect(() => {
    soundManager.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    announcer.enabled = voiceEnabled;
  }, [voiceEnabled]);

  // Timer effect
  useEffect(() => {
    if (!state.isTimerRunning || state.isMatchOver) return;

    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isTimerRunning, state.isMatchOver]);

  // Save matches to localStorage
  const handleSaveMatchToHistory = (completed: CompletedMatch) => {
    const updated = [completed, ...completedMatches];
    setCompletedMatches(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_MATCHES, JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteHistoryMatch = (id: string) => {
    const updated = completedMatches.filter((m) => m.id !== id);
    setCompletedMatches(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_MATCHES, JSON.stringify(updated));
    } catch {}
  };

  const handleClearHistory = () => {
    setCompletedMatches([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_MATCHES);
    } catch {}
  };

  // Helper to get formatted score string for speech announcement
  const getAnnouncementScore = (sA: number, sB: number, isBt: boolean, isTb: boolean) => {
    if (isBt && !isTb) {
      return {
        a: formatBeachTennisPoint(sA, false),
        b: formatBeachTennisPoint(sB, false),
      };
    }
    return { a: sA.toString(), b: sB.toString() };
  };

  // ADD POINT ACTION
  const handleAddPoint = useCallback(
    (scoringTeam: 'teamA' | 'teamB') => {
      if (state.isMatchOver) return;

      soundManager.playPointSound();

      setState((prev) => {
        // Snapshot for undo
        const action: MatchPointAction = {
          team: scoringTeam,
          prevScoreA: prev.scoreA,
          prevScoreB: prev.scoreB,
          prevGamesA: prev.gamesA,
          prevGamesB: prev.gamesB,
          prevSetsA: prev.setsWonA,
          prevSetsB: prev.setsWonB,
          prevServer: prev.server,
          timestamp: Date.now(),
        };

        const updatedHistory = [...prev.history, action];
        let nextScoreA = prev.scoreA;
        let nextScoreB = prev.scoreB;
        let nextGamesA = prev.gamesA;
        let nextGamesB = prev.gamesB;
        let nextSetsWonA = prev.setsWonA;
        let nextSetsWonB = prev.setsWonB;
        let nextServer = prev.server;
        let nextSetHistory = [...prev.setHistory];
        let nextCurrentSetIndex = prev.currentSetIndex;
        let nextIsTiebreak = prev.isTiebreak;
        let nextIsMatchOver = false;
        let nextMatchWinner: 'teamA' | 'teamB' | undefined = undefined;

        // 1. BEACH TENNIS SCORING RULES
        if (prev.sport === 'beach_tennis') {
          if (prev.isTiebreak) {
            // TIE-BREAK POINT
            if (scoringTeam === 'teamA') nextScoreA += 1;
            else nextScoreB += 1;

            // Tiebreak serve alternation rule:
            // Server serves 1st point, then alternate every 2 points: (scoreA + scoreB) % 2 === 1
            const totalTb = nextScoreA + nextScoreB;
            if (totalTb % 2 === 1) {
              nextServer = prev.server === 'teamA' ? 'teamB' : 'teamA';
            }

            // Check tiebreak win
            const tbTarget = getSetTargetPoints(prev, config);
            const aWon = nextScoreA >= tbTarget && nextScoreA - nextScoreB >= 2;
            const bWon = nextScoreB >= tbTarget && nextScoreB - nextScoreA >= 2;

            if (aWon || bWon) {
              const tbWinner = aWon ? 'teamA' : 'teamB';
              if (tbWinner === 'teamA') {
                nextGamesA += 1;
                nextSetsWonA += 1;
              } else {
                nextGamesB += 1;
                nextSetsWonB += 1;
              }

              nextSetHistory.push({
                teamA: nextGamesA,
                teamB: nextGamesB,
                winner: tbWinner,
                tiebreakScore: { teamA: nextScoreA, teamB: nextScoreB },
              });

              nextScoreA = 0;
              nextScoreB = 0;
              nextIsTiebreak = false;

              if (nextSetsWonA >= config.setsToWin || nextSetsWonB >= config.setsToWin) {
                nextIsMatchOver = true;
                nextMatchWinner = nextSetsWonA >= config.setsToWin ? 'teamA' : 'teamB';
              } else {
                nextCurrentSetIndex += 1;
                nextGamesA = 0;
                nextGamesB = 0;
              }
            }
          } else {
            // REGULAR BEACH TENNIS GAME POINT (0, 15, 30, 40)
            const currentPoint = scoringTeam === 'teamA' ? prev.scoreA : prev.scoreB;
            const oppPoint = scoringTeam === 'teamA' ? prev.scoreB : prev.scoreA;

            // If team was at 40 (val 3), or if it's 40-40 with golden point -> Game Won!
            const winsGame = currentPoint === 3;

            if (winsGame) {
              // Game won by scoringTeam!
              if (scoringTeam === 'teamA') nextGamesA += 1;
              else nextGamesB += 1;

              nextScoreA = 0;
              nextScoreB = 0;

              // Server switches every game in tennis
              nextServer = prev.server === 'teamA' ? 'teamB' : 'teamA';

              // Check if set is won or goes to tie-break
              const gamesTarget = getSetTargetPoints(prev, config);

              // Check tiebreak trigger (e.g. 6-6)
              if (nextGamesA === config.tiebreakAtGames && nextGamesB === config.tiebreakAtGames) {
                nextIsTiebreak = true;
              } else {
                // Check normal set win
                const aWonSet =
                  (nextGamesA >= gamesTarget && nextGamesA - nextGamesB >= 2) ||
                  (nextGamesA === gamesTarget + 1 && nextGamesB === gamesTarget - 1);
                const bWonSet =
                  (nextGamesB >= gamesTarget && nextGamesB - nextGamesA >= 2) ||
                  (nextGamesB === gamesTarget + 1 && nextGamesA === gamesTarget - 1);

                if (aWonSet || bWonSet) {
                  const setWinner = aWonSet ? 'teamA' : 'teamB';
                  if (setWinner === 'teamA') nextSetsWonA += 1;
                  else nextSetsWonB += 1;

                  nextSetHistory.push({
                    teamA: nextGamesA,
                    teamB: nextGamesB,
                    winner: setWinner,
                  });

                  if (nextSetsWonA >= config.setsToWin || nextSetsWonB >= config.setsToWin) {
                    nextIsMatchOver = true;
                    nextMatchWinner = nextSetsWonA >= config.setsToWin ? 'teamA' : 'teamB';
                  } else {
                    nextCurrentSetIndex += 1;
                    nextGamesA = 0;
                    nextGamesB = 0;
                    // If best of 3 and deciding set 3, check super tiebreak
                    if (
                      config.beachTennisFormat === 'best_of_3' &&
                      config.superTiebreakFinalSet &&
                      nextCurrentSetIndex === 2
                    ) {
                      nextIsTiebreak = true;
                    }
                  }
                }
              }
            } else {
              // Normal point step (0 -> 15 -> 30 -> 40)
              if (scoringTeam === 'teamA') nextScoreA += 1;
              else nextScoreB += 1;
            }
          }
        } else {
          // 2. VOLLEYBALL & BADMINTON SCORING RULES
          if (scoringTeam === 'teamA') nextScoreA += 1;
          else nextScoreB += 1;

          // Serve change rule:
          // In volleyball and badminton, the team that wins the rally serves next!
          if (prev.server !== scoringTeam) {
            nextServer = scoringTeam;
          }

          // Badminton service court update (even = right, odd = left)
          let nextCourt = prev.servingCourt;
          if (prev.sport === 'badminton') {
            const serverScore = nextServer === 'teamA' ? nextScoreA : nextScoreB;
            nextCourt = getBadmintonServiceCourt(serverScore);
          }

          // Check if set won
          const winnerOfSet = checkSetWinner(nextScoreA, nextScoreB, prev, config);

          if (winnerOfSet) {
            if (winnerOfSet === 'teamA') nextSetsWonA += 1;
            else nextSetsWonB += 1;

            nextSetHistory.push({
              teamA: nextScoreA,
              teamB: nextScoreB,
              winner: winnerOfSet,
            });

            // Check if match won
            if (nextSetsWonA >= config.setsToWin || nextSetsWonB >= config.setsToWin) {
              nextIsMatchOver = true;
              nextMatchWinner = nextSetsWonA >= config.setsToWin ? 'teamA' : 'teamB';
            } else {
              // Prepare next set
              nextScoreA = 0;
              nextScoreB = 0;
              nextCurrentSetIndex += 1;
            }
          }

          return {
            ...prev,
            scoreA: nextScoreA,
            scoreB: nextScoreB,
            setsWonA: nextSetsWonA,
            setsWonB: nextSetsWonB,
            server: nextServer,
            servingCourt: nextCourt,
            setHistory: nextSetHistory,
            currentSetIndex: nextCurrentSetIndex,
            isMatchOver: nextIsMatchOver,
            matchWinner: nextMatchWinner,
            timeoutsA: prev.sport === 'volleyball_indoor' ? 2 : 1,
            timeoutsB: prev.sport === 'volleyball_indoor' ? 2 : 1,
            history: updatedHistory,
            redoHistory: [],
          };
        }

        // Return updated beach tennis state
        return {
          ...prev,
          scoreA: nextScoreA,
          scoreB: nextScoreB,
          gamesA: nextGamesA,
          gamesB: nextGamesB,
          setsWonA: nextSetsWonA,
          setsWonB: nextSetsWonB,
          server: nextServer,
          setHistory: nextSetHistory,
          currentSetIndex: nextCurrentSetIndex,
          isTiebreak: nextIsTiebreak,
          isMatchOver: nextIsMatchOver,
          matchWinner: nextMatchWinner,
          history: updatedHistory,
          redoHistory: [],
        };
      });
    },
    [state.isMatchOver, config]
  );

  // Trigger sound / speech after state change
  const prevStateRef = useRef(state);
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;

    // Check if match just ended
    if (!prev.isMatchOver && state.isMatchOver && state.matchWinner) {
      soundManager.playMatchEndWhistle();
      setIsSummaryOpen(true);
      const winnerName = state[state.matchWinner].name;
      announcer.speak(`Fim de jogo! Vitória de ${winnerName}!`);
      return;
    }

    // Check if set was won
    if (state.setHistory.length > prev.setHistory.length) {
      soundManager.playWhistle(true);
      const lastSet = state.setHistory[state.setHistory.length - 1];
      const setWinnerName = lastSet.winner ? state[lastSet.winner].name : '';
      announcer.speak(`Fim do set! Vitória de ${setWinnerName}!`);
      return;
    }

    // Voice announcement of current score
    if (voiceEnabled && (state.scoreA !== prev.scoreA || state.scoreB !== prev.scoreB)) {
      const isBt = state.sport === 'beach_tennis';
      const scoreObj = getAnnouncementScore(state.scoreA, state.scoreB, isBt, state.isTiebreak);

      const critical = getCriticalPointNotice(state, config);
      const extraNotice = critical.message || undefined;

      announcer.announceScore(
        scoreObj.a,
        scoreObj.b,
        state[state.server].name,
        extraNotice
      );
    }
  }, [state, voiceEnabled, config]);

  // SUBTRACT POINT ACTION (Undo 1 point on specific team)
  const handleSubtractPoint = useCallback(
    (teamId: 'teamA' | 'teamB') => {
      soundManager.playUndoSound();
      setState((prev) => {
        if (teamId === 'teamA') {
          if (prev.scoreA <= 0) return prev;
          return { ...prev, scoreA: prev.scoreA - 1 };
        } else {
          if (prev.scoreB <= 0) return prev;
          return { ...prev, scoreB: prev.scoreB - 1 };
        }
      });
    },
    []
  );

  // FULL UNDO ACTION
  const handleUndo = useCallback(() => {
    if (state.history.length === 0) return;

    soundManager.playUndoSound();

    setState((prev) => {
      const lastAction = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);
      const newRedo = [...prev.redoHistory, lastAction];

      // If we reversed across a set boundary, restore previous set
      const setsDiffer =
        lastAction.prevSetsA !== prev.setsWonA || lastAction.prevSetsB !== prev.setsWonB;
      const restoredSetHistory = setsDiffer
        ? prev.setHistory.slice(0, -1)
        : prev.setHistory;

      return {
        ...prev,
        scoreA: lastAction.prevScoreA,
        scoreB: lastAction.prevScoreB,
        gamesA: lastAction.prevGamesA ?? prev.gamesA,
        gamesB: lastAction.prevGamesB ?? prev.gamesB,
        setsWonA: lastAction.prevSetsA,
        setsWonB: lastAction.prevSetsB,
        server: lastAction.prevServer,
        setHistory: restoredSetHistory,
        currentSetIndex: restoredSetHistory.length,
        isMatchOver: false,
        matchWinner: undefined,
        history: newHistory,
        redoHistory: newRedo,
      };
    });
  }, [state.history]);

  // REDO ACTION
  const handleRedo = useCallback(() => {
    if (state.redoHistory.length === 0) return;
    const action = state.redoHistory[state.redoHistory.length - 1];
    handleAddPoint(action.team);
  }, [state.redoHistory, handleAddPoint]);

  // TOGGLE SERVER
  const handleToggleServer = (teamId: 'teamA' | 'teamB') => {
    setState((prev) => ({
      ...prev,
      server: teamId,
      servingCourt:
        prev.sport === 'badminton'
          ? getBadmintonServiceCourt(teamId === 'teamA' ? prev.scoreA : prev.scoreB)
          : prev.servingCourt,
    }));
  };

  // SWAP SIDES
  const handleSwapSides = () => {
    soundManager.playSwapSound();
    setState((prev) => ({
      ...prev,
      isSwappedSides: !prev.isSwappedSides,
    }));
  };

  // REQUEST TIMEOUT
  const handleRequestTimeout = (teamId?: 'teamA' | 'teamB', teamName?: string) => {
    if (teamId) {
      setState((prev) => ({
        ...prev,
        timeoutsA: teamId === 'teamA' ? Math.max(0, prev.timeoutsA - 1) : prev.timeoutsA,
        timeoutsB: teamId === 'teamB' ? Math.max(0, prev.timeoutsB - 1) : prev.timeoutsB,
      }));
    }
    setTimeoutTeamName(teamName);
    setIsTimeoutOpen(true);
  };

  // SELECT SPORT
  const handleSelectSport = (newSport: SportType) => {
    const newConfig = SPORT_DEFAULTS[newSport];
    setConfig(newConfig);
    setState({
      sport: newSport,
      teamA: state.teamA,
      teamB: state.teamB,
      scoreA: 0,
      scoreB: 0,
      gamesA: 0,
      gamesB: 0,
      setsWonA: 0,
      setsWonB: 0,
      setHistory: [],
      currentSetIndex: 0,
      server: 'teamA',
      servingCourt: 'right',
      isTiebreak: false,
      isMatchOver: false,
      timeoutsA: newSport === 'volleyball_indoor' ? 2 : 1,
      timeoutsB: newSport === 'volleyball_indoor' ? 2 : 1,
      startTime: Date.now(),
      elapsedSeconds: 0,
      isTimerRunning: true,
      isSwappedSides: false,
      history: [],
      redoHistory: [],
    });
  };

  // RESET MATCH
  const handleResetMatch = () => {
    setState((prev) => ({
      ...prev,
      scoreA: 0,
      scoreB: 0,
      gamesA: 0,
      gamesB: 0,
      setsWonA: 0,
      setsWonB: 0,
      setHistory: [],
      currentSetIndex: 0,
      server: 'teamA',
      servingCourt: 'right',
      isTiebreak: false,
      isMatchOver: false,
      matchWinner: undefined,
      timeoutsA: prev.sport === 'volleyball_indoor' ? 2 : 1,
      timeoutsB: prev.sport === 'volleyball_indoor' ? 2 : 1,
      startTime: Date.now(),
      elapsedSeconds: 0,
      isTimerRunning: true,
      history: [],
      redoHistory: [],
    }));
  };

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.key === '1') {
        handleAddPoint('teamA');
      } else if (e.key === '2') {
        handleAddPoint('teamB');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === 's') {
        handleSwapSides();
      } else if (e.key.toLowerCase() === 't') {
        handleRequestTimeout();
      } else if (e.key.toLowerCase() === 'w') {
        soundManager.playWhistle(true);
      } else if (e.key.toLowerCase() === 'm') {
        setIsArenaMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddPoint, handleUndo, handleRedo]);

  return (
    <div className="h-screen max-h-screen w-screen max-w-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-400 selection:text-neutral-950 overflow-hidden">
      {/* Offline Connectivity Toast */}
      <OfflineIndicator />

      {/* Mobile Orientation Hint Banner for Android / Smartphones */}
      <LandscapeBanner />

      {/* Top Header & Navigation */}
      <ScoreboardHeader
        currentSport={state.sport}
        onSelectSport={handleSelectSport}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        elapsedSeconds={state.elapsedSeconds}
        isTimerRunning={state.isTimerRunning}
        onToggleTimer={() =>
          setState((prev) => ({ ...prev, isTimerRunning: !prev.isTimerRunning }))
        }
        onResetTimer={() => setState((prev) => ({ ...prev, elapsedSeconds: 0 }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        isArenaMode={isArenaMode}
        onToggleArenaMode={() => setIsArenaMode((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 flex flex-col justify-center py-0.5 sm:py-1 overflow-hidden">
        {/* Dynamic Sport Rules and Critical Point Notices */}
        <SportRuleNotice
          state={state}
          config={config}
          onSwapSides={handleSwapSides}
        />

        {/* Big Interactive Score Display */}
        <ScoreDisplay
          state={state}
          config={config}
          isArenaMode={isArenaMode}
          onAddPoint={handleAddPoint}
          onSubtractPoint={handleSubtractPoint}
          onToggleServer={handleToggleServer}
          onRequestTimeout={handleRequestTimeout}
        />
      </main>

      {/* Bottom Referee & Match Controls Bar */}
      <MatchControls
        canUndo={state.history.length > 0}
        canRedo={state.redoHistory.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSwapSides={handleSwapSides}
        onRequestTimeout={() => handleRequestTimeout()}
        onResetMatch={handleResetMatch}
        onOpenSummary={() => setIsSummaryOpen(true)}
        isMatchOver={state.isMatchOver}
        isArenaMode={isArenaMode}
      />

      {/* Discreet Copyright Footer */}
      <div className="w-full text-center pb-1 text-[10px] sm:text-[11px] text-neutral-500 font-medium select-none shrink-0 tracking-wider">
        © Alisson Salvador 2026
      </div>

      {/* Modals */}
      <TimeoutModal
        isOpen={isTimeoutOpen}
        onClose={() => setIsTimeoutOpen(false)}
        teamName={timeoutTeamName}
        defaultSeconds={30}
      />

      <MatchSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        teamA={state.teamA}
        teamB={state.teamB}
        onSave={(newConfig, newTeamA, newTeamB) => {
          setConfig(newConfig);
          setState((prev) => ({
            ...prev,
            teamA: newTeamA,
            teamB: newTeamB,
            sport: newConfig.sport,
          }));
        }}
      />

      <MatchSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        state={state}
        config={config}
        onStartNewMatch={handleResetMatch}
        onSaveMatchToHistory={handleSaveMatchToHistory}
      />

      <MatchHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        matches={completedMatches}
        onDeleteMatch={handleDeleteHistoryMatch}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
