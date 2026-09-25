import { SportRulesConfig, SportType, MatchState, SetScore } from '../types/scoreboard';

export const SPORT_DEFAULTS: Record<SportType, SportRulesConfig> = {
  volleyball_indoor: {
    sport: 'volleyball_indoor',
    pointsPerNormalSet: 25,
    pointsDecidingSet: 15,
    setsToWin: 3, // Best of 5 (or 2 for best of 3)
    mustWinByTwo: true,
    beachTennisFormat: 'best_of_3',
    goldenPoint: false,
    tiebreakAtGames: 6,
    tiebreakPoints: 7,
    superTiebreakFinalSet: false,
    sideSwapRule: {
      type: 'set_end',
    },
  },
  volleyball_beach: {
    sport: 'volleyball_beach',
    pointsPerNormalSet: 21,
    pointsDecidingSet: 15,
    setsToWin: 2, // Best of 3
    mustWinByTwo: true,
    beachTennisFormat: 'best_of_3',
    goldenPoint: false,
    tiebreakAtGames: 6,
    tiebreakPoints: 7,
    superTiebreakFinalSet: false,
    sideSwapRule: {
      type: 'points_sum',
      interval: 7, // 7 points for sets 1-2, 5 for set 3
    },
  },
  beach_tennis: {
    sport: 'beach_tennis',
    pointsPerNormalSet: 6, // 6 games
    pointsDecidingSet: 6,
    setsToWin: 1, // Single pro set to 6 is standard in tournaments
    mustWinByTwo: false, // In standard set, 6-4 or tiebreak at 6-6
    beachTennisFormat: 'single_set_6',
    goldenPoint: true, // No-Ad Golden Point
    tiebreakAtGames: 6,
    tiebreakPoints: 7,
    superTiebreakFinalSet: true,
    sideSwapRule: {
      type: 'games_sum',
      interval: 1, // Odd games
    },
  },
  badminton: {
    sport: 'badminton',
    pointsPerNormalSet: 21,
    pointsDecidingSet: 21,
    setsToWin: 2, // Best of 3
    mustWinByTwo: true,
    hardScoreCap: 30, // BWF Rule: at 29-29, 30th point wins
    beachTennisFormat: 'best_of_3',
    goldenPoint: false,
    tiebreakAtGames: 6,
    tiebreakPoints: 7,
    superTiebreakFinalSet: false,
    sideSwapRule: {
      type: 'set_end',
    },
  },
};

// Beach tennis point translation: 0, 15, 30, 40
export const BT_POINTS_MAP = ['0', '15', '30', '40'];

export function formatBeachTennisPoint(points: number, isTiebreak: boolean): string {
  if (isTiebreak) {
    return points.toString();
  }
  if (points <= 3) {
    return BT_POINTS_MAP[points] || '40';
  }
  return '40';
}

// Get target points for current set in Volleyball/Badminton
export function getSetTargetPoints(state: MatchState, config: SportRulesConfig): number {
  if (state.sport === 'beach_tennis') {
    if (state.isTiebreak) {
      const isSuperTiebreak =
        config.superTiebreakFinalSet &&
        config.beachTennisFormat === 'best_of_3' &&
        state.currentSetIndex === 2;
      return isSuperTiebreak ? 10 : config.tiebreakPoints;
    }
    return config.beachTennisFormat === 'single_set_8' ? 8 : (config.beachTennisFormat === 'short_set_4' ? 4 : 6);
  }

  // Volleyball deciding set
  if (state.sport === 'volleyball_indoor' || state.sport === 'volleyball_beach') {
    const isDecidingSet = state.setsWonA === config.setsToWin - 1 && state.setsWonB === config.setsToWin - 1;
    if (isDecidingSet) {
      return config.pointsDecidingSet;
    }
    return config.pointsPerNormalSet;
  }

  // Badminton is always 21
  return config.pointsPerNormalSet;
}

// Check if current set has been won
export function checkSetWinner(
  scoreA: number,
  scoreB: number,
  state: MatchState,
  config: SportRulesConfig
): 'teamA' | 'teamB' | null {
  if (state.sport === 'beach_tennis') {
    // In Beach Tennis, this is handled via game progression and tiebreak
    if (state.isTiebreak) {
      const target = getSetTargetPoints(state, config);
      if (scoreA >= target && scoreA - scoreB >= 2) return 'teamA';
      if (scoreB >= target && scoreB - scoreA >= 2) return 'teamB';
      return null;
    }

    const gamesTarget = getSetTargetPoints(state, config);
    // Regular set won if reached target with 2 games lead (e.g. 6-4) or reached target+1 (e.g. 7-5)
    if (state.gamesA >= gamesTarget && state.gamesA - state.gamesB >= 2) return 'teamA';
    if (state.gamesB >= gamesTarget && state.gamesB - state.gamesA >= 2) return 'teamB';
    if (state.gamesA === gamesTarget + 1 && state.gamesB === gamesTarget - 1) return 'teamA';
    if (state.gamesB === gamesTarget + 1 && state.gamesA === gamesTarget - 1) return 'teamB';

    return null;
  }

  // Badminton
  if (state.sport === 'badminton') {
    const target = 21;
    const hardCap = config.hardScoreCap || 30;

    // Hard cap at 30
    if (scoreA === hardCap) return 'teamA';
    if (scoreB === hardCap) return 'teamB';

    if (scoreA >= target && scoreA - scoreB >= 2) return 'teamA';
    if (scoreB >= target && scoreB - scoreA >= 2) return 'teamB';
    return null;
  }

  // Volleyball
  const target = getSetTargetPoints(state, config);
  if (scoreA >= target && scoreA - scoreB >= 2) return 'teamA';
  if (scoreB >= target && scoreB - scoreA >= 2) return 'teamB';

  return null;
}

// Check if someone is at Set Point or Match Point
export function getCriticalPointNotice(
  state: MatchState,
  config: SportRulesConfig
): {
  type: 'match_point' | 'set_point' | 'game_point' | 'golden_point' | 'deuce' | null;
  team?: 'teamA' | 'teamB';
  message?: string;
} {
  if (state.isMatchOver) return { type: null };

  if (state.sport === 'beach_tennis') {
    // Golden point check
    if (!state.isTiebreak && state.scoreA === 3 && state.scoreB === 3) {
      return {
        type: 'golden_point',
        message: 'PONTO DE OURO! (Golden Point)',
      };
    }

    // Tiebreak set/match point
    if (state.isTiebreak) {
      const target = getSetTargetPoints(state, config);
      const isSetPointA = state.scoreA >= target - 1 && state.scoreA > state.scoreB;
      const isSetPointB = state.scoreB >= target - 1 && state.scoreB > state.scoreA;

      if (isSetPointA || isSetPointB) {
        const leader = isSetPointA ? 'teamA' : 'teamB';
        const setsIfWon = (leader === 'teamA' ? state.setsWonA : state.setsWonB) + 1;
        const isMatch = setsIfWon >= config.setsToWin;
        return {
          type: isMatch ? 'match_point' : 'set_point',
          team: leader,
          message: isMatch ? 'MATCH POINT!' : 'SET POINT!',
        };
      }
      return { type: null };
    }

    // Regular game point / break point
    const gamesTarget = getSetTargetPoints(state, config);
    const isGamePointA = state.scoreA === 3 && state.scoreB < 3;
    const isGamePointB = state.scoreB === 3 && state.scoreA < 3;

    if (isGamePointA || isGamePointB) {
      const leader = isGamePointA ? 'teamA' : 'teamB';
      const gamesIfWon = leader === 'teamA' ? state.gamesA + 1 : state.gamesB + 1;
      const opponentGames = leader === 'teamA' ? state.gamesB : state.gamesA;

      const wouldWinSet =
        (gamesIfWon >= gamesTarget && gamesIfWon - opponentGames >= 2) ||
        (gamesIfWon === gamesTarget + 1 && opponentGames === gamesTarget - 1);

      if (wouldWinSet) {
        const setsIfWon = (leader === 'teamA' ? state.setsWonA : state.setsWonB) + 1;
        const isMatch = setsIfWon >= config.setsToWin;
        return {
          type: isMatch ? 'match_point' : 'set_point',
          team: leader,
          message: isMatch ? 'MATCH POINT!' : 'SET POINT!',
        };
      }

      return {
        type: 'game_point',
        team: leader,
        message: 'GAME POINT',
      };
    }

    return { type: null };
  }

  // Volleyball & Badminton
  const target = getSetTargetPoints(state, config);
  const a = state.scoreA;
  const b = state.scoreB;

  // Deuce / Iguais
  if (state.sport === 'badminton' && a >= 20 && b >= 20 && a === b && a < 29) {
    return { type: 'deuce', message: 'IGUAIS (Deuce - Vantagem de 2)' };
  }
  if ((state.sport === 'volleyball_indoor' || state.sport === 'volleyball_beach') && a >= target - 1 && b >= target - 1 && a === b) {
    return { type: 'deuce', message: 'IGUAIS (Diferença de 2)' };
  }

  const isPointA = (a >= target - 1 && a > b) || (state.sport === 'badminton' && a === 29);
  const isPointB = (b >= target - 1 && b > a) || (state.sport === 'badminton' && b === 29);

  if (isPointA || isPointB) {
    const leader = isPointA ? 'teamA' : 'teamB';
    const isMatch = (leader === 'teamA' ? state.setsWonA : state.setsWonB) + 1 >= config.setsToWin;
    return {
      type: isMatch ? 'match_point' : 'set_point',
      team: leader,
      message: isMatch ? 'MATCH POINT!' : 'SET POINT!',
    };
  }

  return { type: null };
}

// Side swap check
export function checkSideSwapNeeded(
  state: MatchState,
  config: SportRulesConfig
): { needed: boolean; reason: string } {
  // Beach Volleyball: every 7 points (sets 1-2) or every 5 points (set 3)
  if (state.sport === 'volleyball_beach') {
    const isDecidingSet = state.currentSetIndex === 2;
    const interval = isDecidingSet ? 5 : 7;
    const totalPoints = state.scoreA + state.scoreB;
    if (totalPoints > 0 && totalPoints % interval === 0) {
      return {
        needed: true,
        reason: `Troca de Lado a cada ${interval} pontos somados!`,
      };
    }
  }

  // Volleyball Indoor deciding set 5: swap at 8 points
  if (state.sport === 'volleyball_indoor') {
    const isDecidingSet = state.setsWonA === config.setsToWin - 1 && state.setsWonB === config.setsToWin - 1;
    if (isDecidingSet && (state.scoreA === 8 || state.scoreB === 8)) {
      return {
        needed: true,
        reason: 'Troca de Lado no 8º ponto do tie-break!',
      };
    }
  }

  // Beach tennis tiebreak: every 6 points
  if (state.sport === 'beach_tennis' && state.isTiebreak) {
    const totalTbPoints = state.scoreA + state.scoreB;
    if (totalTbPoints > 0 && totalTbPoints % 6 === 0) {
      return {
        needed: true,
        reason: 'Troca de Lado no Tie-break (a cada 6 pontos)!',
      };
    }
  }

  // Beach tennis regular games: odd sum of games
  if (state.sport === 'beach_tennis' && !state.isTiebreak) {
    // When game concludes, if (gamesA + gamesB) is odd, swap sides!
    const totalGames = state.gamesA + state.gamesB;
    if (totalGames > 0 && totalGames % 2 === 1 && state.scoreA === 0 && state.scoreB === 0) {
      return {
        needed: true,
        reason: `Troca de Lado (Total de ${totalGames} games - número ímpar)!`,
      };
    }
  }

  // Badminton 11-point interval or set swap
  if (state.sport === 'badminton') {
    const maxScore = Math.max(state.scoreA, state.scoreB);
    if (maxScore === 11) {
      return {
        needed: false,
        reason: 'Intervalo oficial de 60 segundos (11 pontos atingidos)!',
      };
    }
  }

  return { needed: false, reason: '' };
}

// Badminton serving court: even = right, odd = left
export function getBadmintonServiceCourt(serverScore: number): 'right' | 'left' {
  return serverScore % 2 === 0 ? 'right' : 'left';
}
