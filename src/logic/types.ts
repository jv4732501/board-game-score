export interface Category {
  id: string;
  name: string;
  key: string;
}

export interface Template {
  id: string;
  name: string;
  categories: Category[];
  formula: string | null;
  winDirection: 'high' | 'low';
  builtIn: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: string;
}

export interface ScoreEntry {
  id: string;
  value: number;
}

export interface GameSession {
  id: string;
  templateId: string;
  playerIds: string[];
  entries: Record<string, Record<string, ScoreEntry[]>>;
  moveLog: { playerId: string; categoryId: string; entryId: string }[];
  startedAt: string;
  finishedAt: string | null;
}

export interface CategoryTotal {
  categoryId: string;
  categoryName: string;
  total: number;
}

export interface StandingRow {
  playerId: string;
  playerName: string;
  categoryTotals: CategoryTotal[];
  total: number;
  rank: number;
}

export interface HistoryEntry {
  gameId: string;
  templateName: string;
  playerNames: string[];
  finishedAt: string;
  standings: StandingRow[];
}
