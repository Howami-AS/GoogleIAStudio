export type SportType = 'volleyball_indoor' | 'volleyball_beach' | 'beach_tennis' | 'badminton';

export interface Team {
  id: 'teamA' | 'teamB';
  name: string;
  players?: string; // e.g. "Lucas / Gabriel"
  color: string;
  secondaryColor?: string;
  textColor?: string;
}

export interface SetScore {
  teamA: number;
  teamB: number;
  winner?: 'teamA' | 'teamB';
  tiebreakScore?: { teamA: number; teamB: number };
}

export type BeachTennisFormat = 'single_set_6' | 'single_set_8' | 'best_of_3' | 'short_set_4';

export interface SportRulesConfig {
  sport: SportType;
  // Volleyball & Badminton
  pointsPerNormalSet: number;
  pointsDecidingSet: number;
  setsToWin: number; // 2 for best of 3, 3 for best of 5, 1 for 1-set
  mustWinByTwo: boolean;
  hardScoreCap?: number; // 30 for badminton
  // Beach Tennis
  beachTennisFormat: BeachTennisFormat;
  goldenPoint: boolean; // 40-40 sudden death
  tiebreakAtGames: number; // 6 for 6-6
  tiebreakPoints: number; // 7 pts
  superTiebreakFinalSet: boolean; // 10 pts final set
  // Side swap
  sideSwapRule?: {
    type: 'points_sum' | 'games_sum' | 'set_end' | 'tiebreak_points';
    interval?: number; // e.g., 7 for beach volley, 6 for beach tennis tiebreak, odd games
  };
}

export interface MatchPointAction {
  team: 'teamA' | 'teamB';
  prevScoreA: number;
  prevScoreB: number;
  prevGamesA?: number;
  prevGamesB?: number;
  prevSetsA: number;
  prevSetsB: number;
  prevServer: 'teamA' | 'teamB';
  timestamp: number;
  note?: string;
}

export interface MatchState {
  sport: SportType;
  teamA: Team;
  teamB: Team;
  scoreA: number; // Current set points, or Beach Tennis tiebreak points
  scoreB: number;
  gamesA: number; // Beach Tennis games won in current set
  gamesB: number;
  setsWonA: number;
  setsWonB: number;
  setHistory: SetScore[];
  currentSetIndex: number; // 0-indexed
  server: 'teamA' | 'teamB';
  servingCourt?: 'right' | 'left'; // Badminton: even = right, odd = left
  isTiebreak: boolean;
  isMatchOver: boolean;
  matchWinner?: 'teamA' | 'teamB';
  timeoutsA: number;
  timeoutsB: number;
  startTime: number;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  isSwappedSides: boolean; // teamA on left vs right
  history: MatchPointAction[];
  redoHistory: MatchPointAction[];
}

export interface CompletedMatch {
  id: string;
  date: string;
  sport: SportType;
  teamA: { name: string; players?: string };
  teamB: { name: string; players?: string };
  winner: 'teamA' | 'teamB';
  finalSets: { teamA: number; teamB: number };
  setDetails: string[];
  totalDurationSeconds: number;
}
