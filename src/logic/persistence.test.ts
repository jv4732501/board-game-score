import { describe, it, expect } from 'vitest';
import {
  buildBackup,
  deserialize,
  isResumable,
  mergeBackup,
  serialize,
  validateBackup,
  type AppState,
} from './persistence';
import type { GameSession, HistoryEntry, Player, Template } from './types';

const EMPTY_STATE: AppState = { players: [], templates: [], game: null, history: [] };

const PLAYER: Player = { id: 'p1', name: 'Alice', color: '#ff0000' };
const TEMPLATE: Template = {
  id: 't1',
  name: 'Custom',
  categories: [{ id: 'c1', name: 'Points', key: 'points' }],
  formula: null,
  winDirection: 'high',
  builtIn: false,
};
const HISTORY_ENTRY: HistoryEntry = {
  gameId: 'g1',
  templateName: 'Custom',
  playerNames: ['Alice'],
  finishedAt: '2026-08-21T00:00:00.000Z',
  standings: [
    {
      playerId: 'p1',
      playerName: 'Alice',
      categoryTotals: [{ categoryId: 'c1', categoryName: 'Points', total: 10 }],
      total: 10,
      rank: 1,
    },
  ],
};
const IN_PROGRESS_GAME: GameSession = {
  id: 'g2',
  templateId: 't1',
  playerIds: ['p1'],
  entries: {},
  moveLog: [],
  startedAt: '2026-08-21T00:00:00.000Z',
  finishedAt: null,
};

describe('serialize / deserialize', () => {
  it('round-trips a value', () => {
    expect(deserialize<{ a: number }>(serialize({ a: 1 }))).toEqual({ a: 1 });
  });

  it('returns null for null input', () => {
    expect(deserialize(null)).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(deserialize('not json')).toBeNull();
  });
});

describe('isResumable', () => {
  it('is true for an unfinished game', () => {
    expect(isResumable(IN_PROGRESS_GAME)).toBe(true);
  });

  it('is false for null', () => {
    expect(isResumable(null)).toBe(false);
  });

  it('is false for a finished game', () => {
    expect(isResumable({ ...IN_PROGRESS_GAME, finishedAt: '2026-08-21T01:00:00.000Z' })).toBe(
      false,
    );
  });
});

describe('buildBackup / validateBackup', () => {
  it('round-trips app state through a backup', () => {
    const state: AppState = { players: [PLAYER], templates: [TEMPLATE], game: null, history: [] };
    const backup = buildBackup(state, Date.parse('2026-08-21T00:00:00.000Z'));
    expect(backup.app).toBe('boardgamescore');
    expect(backup.formatVersion).toBe(1);
    const validated = validateBackup(backup);
    expect(validated.ok).toBe(true);
    if (validated.ok) {
      expect(validated.backup.players).toEqual([PLAYER]);
      expect(validated.backup.templates).toEqual([TEMPLATE]);
    }
  });

  it('rejects a non-backup object', () => {
    expect(validateBackup({ foo: 'bar' })).toEqual({
      ok: false,
      reason: 'Not a Board Game Score backup file.',
    });
  });

  it('rejects a backup from a newer format version', () => {
    const result = validateBackup({ app: 'boardgamescore', formatVersion: 2 });
    expect(result.ok).toBe(false);
  });
});

describe('mergeBackup', () => {
  it('adds new players, templates, and history entries', () => {
    const backup = buildBackup(
      { players: [PLAYER], templates: [TEMPLATE], game: null, history: [HISTORY_ENTRY] },
      Date.parse('2026-08-21T00:00:00.000Z'),
    );
    const validated = validateBackup(backup);
    if (!validated.ok) throw new Error('expected valid backup');
    const { state, summary } = mergeBackup(EMPTY_STATE, validated.backup);
    expect(state.players).toEqual([PLAYER]);
    expect(state.templates).toEqual([TEMPLATE]);
    expect(state.history).toEqual([HISTORY_ENTRY]);
    expect(summary).toEqual({
      playersAdded: 1,
      playersUpdated: 0,
      templatesAdded: 1,
      templatesUpdated: 0,
      gamesAdded: 1,
      gamesUpdated: 0,
      gameRestored: false,
      gameSkipped: false,
    });
  });

  it('updates existing records instead of duplicating them', () => {
    const updatedPlayer: Player = { ...PLAYER, name: 'Alice Updated' };
    const backup = buildBackup(
      { players: [updatedPlayer], templates: [], game: null, history: [] },
      Date.parse('2026-08-21T00:00:00.000Z'),
    );
    const validated = validateBackup(backup);
    if (!validated.ok) throw new Error('expected valid backup');
    const startState: AppState = { players: [PLAYER], templates: [], game: null, history: [] };
    const { state, summary } = mergeBackup(startState, validated.backup);
    expect(state.players).toEqual([updatedPlayer]);
    expect(summary.playersUpdated).toBe(1);
    expect(summary.playersAdded).toBe(0);
  });

  it('restores a backed-up game when none is in progress locally', () => {
    const backup = buildBackup(
      { players: [], templates: [], game: IN_PROGRESS_GAME, history: [] },
      Date.parse('2026-08-21T00:00:00.000Z'),
    );
    const validated = validateBackup(backup);
    if (!validated.ok) throw new Error('expected valid backup');
    const { state, summary } = mergeBackup(EMPTY_STATE, validated.backup);
    expect(state.game).toEqual(IN_PROGRESS_GAME);
    expect(summary.gameRestored).toBe(true);
    expect(summary.gameSkipped).toBe(false);
  });

  it('skips restoring a backed-up game when one is already in progress locally', () => {
    const backup = buildBackup(
      { players: [], templates: [], game: IN_PROGRESS_GAME, history: [] },
      Date.parse('2026-08-21T00:00:00.000Z'),
    );
    const validated = validateBackup(backup);
    if (!validated.ok) throw new Error('expected valid backup');
    const localGame: GameSession = { ...IN_PROGRESS_GAME, id: 'local-game' };
    const startState: AppState = { players: [], templates: [], game: localGame, history: [] };
    const { state, summary } = mergeBackup(startState, validated.backup);
    expect(state.game).toBe(localGame);
    expect(summary.gameSkipped).toBe(true);
    expect(summary.gameRestored).toBe(false);
  });
});
