import type { GameSession, HistoryEntry, Player, Template } from './types';

export interface AppState {
  players: Player[];
  templates: Template[];
  game: GameSession | null;
  history: HistoryEntry[];
}

export interface Backup extends AppState {
  app: 'boardgamescore';
  formatVersion: 1;
  exportedAt: string;
}

export function serialize(value: unknown): string {
  return JSON.stringify(value);
}

export function deserialize<T>(str: string | null): T | null {
  try {
    return str == null ? null : (JSON.parse(str) as T);
  } catch {
    return null;
  }
}

export function isResumable(game: GameSession | null): boolean {
  return !!game && game.finishedAt === null;
}

export function buildBackup(state: AppState, nowMs: number): Backup {
  return {
    app: 'boardgamescore',
    formatVersion: 1,
    exportedAt: new Date(nowMs).toISOString(),
    players: state.players,
    templates: state.templates,
    game: state.game,
    history: state.history,
  };
}

export type ValidateBackupResult =
  | { ok: true; backup: AppState }
  | { ok: false; reason: string };

export function validateBackup(obj: unknown): ValidateBackupResult {
  const notBackup: ValidateBackupResult = {
    ok: false,
    reason: 'Not a Board Game Score backup file.',
  };
  if (!obj || typeof obj !== 'object') return notBackup;
  const o = obj as Record<string, unknown>;
  if (o.app !== 'boardgamescore') return notBackup;
  if (typeof o.formatVersion === 'number' && o.formatVersion > 1) {
    return { ok: false, reason: 'This backup was made by a newer version of Board Game Score.' };
  }
  const players = Array.isArray(o.players) ? (o.players as Player[]) : [];
  const templates = Array.isArray(o.templates) ? (o.templates as Template[]) : [];
  const history = Array.isArray(o.history) ? (o.history as HistoryEntry[]) : [];
  return {
    ok: true,
    backup: {
      players: players.filter((p) => p && typeof p === 'object'),
      templates: templates.filter((t) => t && typeof t === 'object'),
      history: history.filter((h) => h && typeof h === 'object'),
      game: o.game && typeof o.game === 'object' ? (o.game as GameSession) : null,
    },
  };
}

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const arr = list.slice();
  const i = arr.findIndex((x) => x.id === item.id);
  if (i >= 0) arr[i] = item;
  else arr.push(item);
  return arr;
}

function upsertHistory(history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const arr = history.slice();
  const i = arr.findIndex((h) => h.gameId === entry.gameId);
  if (i >= 0) arr[i] = entry;
  else arr.push(entry);
  return arr;
}

export interface MergeSummary {
  playersAdded: number;
  playersUpdated: number;
  templatesAdded: number;
  templatesUpdated: number;
  gamesAdded: number;
  gamesUpdated: number;
  gameRestored: boolean;
  gameSkipped: boolean;
}

export function mergeBackup(
  state: AppState,
  backup: AppState,
): { state: AppState; summary: MergeSummary } {
  let players = state.players;
  let playersAdded = 0;
  let playersUpdated = 0;
  for (const p of backup.players) {
    if (players.some((x) => x.id === p.id)) playersUpdated += 1;
    else playersAdded += 1;
    players = upsertById(players, p);
  }

  let templates = state.templates;
  let templatesAdded = 0;
  let templatesUpdated = 0;
  for (const t of backup.templates) {
    if (templates.some((x) => x.id === t.id)) templatesUpdated += 1;
    else templatesAdded += 1;
    templates = upsertById(templates, t);
  }

  let history = state.history;
  let gamesAdded = 0;
  let gamesUpdated = 0;
  for (const h of backup.history) {
    if (history.some((x) => x.gameId === h.gameId)) gamesUpdated += 1;
    else gamesAdded += 1;
    history = upsertHistory(history, h);
  }

  let game = state.game;
  let gameRestored = false;
  let gameSkipped = false;
  if (backup.game) {
    if (isResumable(state.game)) {
      gameSkipped = true;
    } else {
      game = backup.game;
      gameRestored = true;
    }
  }

  return {
    state: { players, templates, game, history },
    summary: {
      playersAdded,
      playersUpdated,
      templatesAdded,
      templatesUpdated,
      gamesAdded,
      gamesUpdated,
      gameRestored,
      gameSkipped,
    },
  };
}
