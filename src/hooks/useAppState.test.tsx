import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { appReducer, useAppState, type AppAction } from './useAppState';
import type { AppState } from '../logic/persistence';
import type { GameSession, Player } from '../logic/types';

const EMPTY_STATE: AppState = { players: [], templates: [], game: null, history: [] };

const PLAYER: Player = { id: 'p1', name: 'Alice', color: '#ff0000' };

const GAME: GameSession = {
  id: 'g1',
  templateId: 't1',
  playerIds: ['p1'],
  entries: {},
  moveLog: [],
  startedAt: '2026-08-21T00:00:00.000Z',
  finishedAt: null,
};

describe('appReducer', () => {
  it('adds a new player on UPSERT_PLAYER', () => {
    const next = appReducer(EMPTY_STATE, { type: 'UPSERT_PLAYER', player: PLAYER });
    expect(next.players).toEqual([PLAYER]);
  });

  it('updates an existing player on UPSERT_PLAYER', () => {
    const start: AppState = { ...EMPTY_STATE, players: [PLAYER] };
    const updated = { ...PLAYER, name: 'Alice Updated' };
    const next = appReducer(start, { type: 'UPSERT_PLAYER', player: updated });
    expect(next.players).toEqual([updated]);
  });

  it('removes a player on REMOVE_PLAYER', () => {
    const start: AppState = { ...EMPTY_STATE, players: [PLAYER] };
    const next = appReducer(start, { type: 'REMOVE_PLAYER', id: 'p1' });
    expect(next.players).toEqual([]);
  });

  it('starts a game on START_GAME', () => {
    const next = appReducer(EMPTY_STATE, { type: 'START_GAME', game: GAME });
    expect(next.game).toEqual(GAME);
  });

  it('adds an entry to the active game on ADD_ENTRY', () => {
    const start: AppState = { ...EMPTY_STATE, game: GAME };
    const next = appReducer(start, {
      type: 'ADD_ENTRY',
      playerId: 'p1',
      categoryId: 'c1',
      value: 5,
      entryId: 'e1',
    });
    expect(next.game?.entries.p1.c1).toEqual([{ id: 'e1', value: 5 }]);
  });

  it('undoes the last entry on UNDO_LAST_ENTRY', () => {
    const withEntry = appReducer(
      { ...EMPTY_STATE, game: GAME },
      { type: 'ADD_ENTRY', playerId: 'p1', categoryId: 'c1', value: 5, entryId: 'e1' },
    );
    const next = appReducer(withEntry, { type: 'UNDO_LAST_ENTRY' });
    expect(next.game?.entries.p1.c1).toEqual([]);
  });

  it('finishes the game and appends history on FINISH_GAME, clearing the active game', () => {
    const start: AppState = { ...EMPTY_STATE, game: GAME };
    const historyEntry = {
      gameId: 'g1',
      templateName: 'Test',
      playerNames: ['Alice'],
      finishedAt: '2026-08-21T01:00:00.000Z',
      standings: [],
    };
    const next = appReducer(start, {
      type: 'FINISH_GAME',
      nowIso: '2026-08-21T01:00:00.000Z',
      historyEntry,
    });
    expect(next.game).toBeNull();
    expect(next.history).toEqual([historyEntry]);
  });

  it('replaces state on IMPORT_MERGE', () => {
    const merged: AppState = { players: [PLAYER], templates: [], game: null, history: [] };
    const next = appReducer(EMPTY_STATE, { type: 'IMPORT_MERGE', state: merged });
    expect(next).toEqual(merged);
  });
});

describe('useAppState', () => {
  const STORAGE_KEY = 'boardgamescore.state.v1';

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('starts empty when localStorage has no saved state', () => {
    const { result } = renderHook(() => useAppState());
    expect(result.current.state).toEqual(EMPTY_STATE);
  });

  it('loads previously saved state from localStorage', () => {
    const saved: AppState = { players: [PLAYER], templates: [], game: null, history: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    const { result } = renderHook(() => useAppState());
    expect(result.current.state).toEqual(saved);
  });

  it('persists state to localStorage after a dispatch', () => {
    const { result } = renderHook(() => useAppState());
    act(() => {
      const action: AppAction = { type: 'UPSERT_PLAYER', player: PLAYER };
      result.current.dispatch(action);
    });
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    expect(saved.players).toEqual([PLAYER]);
  });
});
