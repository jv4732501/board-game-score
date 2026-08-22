import { describe, it, expect } from 'vitest';
import { addEntry, createGame, finishGame, removeEntry, undoLastEntry } from './game';

describe('createGame', () => {
  it('creates an empty, unfinished game', () => {
    const game = createGame('game-1', 'tmpl-1', ['p1', 'p2'], '2026-08-21T00:00:00.000Z');
    expect(game).toEqual({
      id: 'game-1',
      templateId: 'tmpl-1',
      playerIds: ['p1', 'p2'],
      entries: {},
      moveLog: [],
      startedAt: '2026-08-21T00:00:00.000Z',
      finishedAt: null,
    });
  });
});

describe('addEntry', () => {
  it('appends a scored entry and a move log record', () => {
    const game = createGame('game-1', 'tmpl-1', ['p1'], '2026-08-21T00:00:00.000Z');
    const next = addEntry(game, 'p1', 'cat-a', 5, 'entry-1');
    expect(next.entries.p1['cat-a']).toEqual([{ id: 'entry-1', value: 5 }]);
    expect(next.moveLog).toEqual([{ playerId: 'p1', categoryId: 'cat-a', entryId: 'entry-1' }]);
  });

  it('does not mutate the original game', () => {
    const game = createGame('game-1', 'tmpl-1', ['p1'], '2026-08-21T00:00:00.000Z');
    addEntry(game, 'p1', 'cat-a', 5, 'entry-1');
    expect(game.entries).toEqual({});
    expect(game.moveLog).toEqual([]);
  });

  it('appends a second entry to the same category', () => {
    let game = createGame('game-1', 'tmpl-1', ['p1'], '2026-08-21T00:00:00.000Z');
    game = addEntry(game, 'p1', 'cat-a', 5, 'entry-1');
    game = addEntry(game, 'p1', 'cat-a', 3, 'entry-2');
    expect(game.entries.p1['cat-a']).toEqual([
      { id: 'entry-1', value: 5 },
      { id: 'entry-2', value: 3 },
    ]);
  });
});

describe('removeEntry', () => {
  it('removes the entry and its move log record', () => {
    let game = createGame('game-1', 'tmpl-1', ['p1'], '2026-08-21T00:00:00.000Z');
    game = addEntry(game, 'p1', 'cat-a', 5, 'entry-1');
    game = addEntry(game, 'p1', 'cat-a', 3, 'entry-2');
    game = removeEntry(game, 'p1', 'cat-a', 'entry-1');
    expect(game.entries.p1['cat-a']).toEqual([{ id: 'entry-2', value: 3 }]);
    expect(game.moveLog).toEqual([{ playerId: 'p1', categoryId: 'cat-a', entryId: 'entry-2' }]);
  });

  it('is a no-op for an unknown entry id', () => {
    let game = createGame('game-1', 'tmpl-1', ['p1'], '2026-08-21T00:00:00.000Z');
    game = addEntry(game, 'p1', 'cat-a', 5, 'entry-1');
    const next = removeEntry(game, 'p1', 'cat-a', 'not-real');
    expect(next.entries.p1['cat-a']).toEqual([{ id: 'entry-1', value: 5 }]);
  });
});

describe('undoLastEntry', () => {
  it('removes the most recently added entry regardless of category', () => {
    let game = createGame('game-1', 'tmpl-1', ['p1'], '2026-08-21T00:00:00.000Z');
    game = addEntry(game, 'p1', 'cat-a', 5, 'entry-1');
    game = addEntry(game, 'p1', 'cat-b', 7, 'entry-2');
    game = undoLastEntry(game);
    expect(game.entries.p1['cat-b']).toEqual([]);
    expect(game.entries.p1['cat-a']).toEqual([{ id: 'entry-1', value: 5 }]);
    expect(game.moveLog).toEqual([{ playerId: 'p1', categoryId: 'cat-a', entryId: 'entry-1' }]);
  });

  it('is a no-op when the move log is empty', () => {
    const game = createGame('game-1', 'tmpl-1', ['p1'], '2026-08-21T00:00:00.000Z');
    expect(undoLastEntry(game)).toEqual(game);
  });
});

describe('finishGame', () => {
  it('sets finishedAt', () => {
    const game = createGame('game-1', 'tmpl-1', ['p1'], '2026-08-21T00:00:00.000Z');
    const finished = finishGame(game, '2026-08-21T01:00:00.000Z');
    expect(finished.finishedAt).toBe('2026-08-21T01:00:00.000Z');
  });
});
