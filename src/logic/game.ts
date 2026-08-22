import type { GameSession } from './types';

export function createGame(
  id: string,
  templateId: string,
  playerIds: string[],
  nowIso: string,
): GameSession {
  return {
    id,
    templateId,
    playerIds,
    entries: {},
    moveLog: [],
    startedAt: nowIso,
    finishedAt: null,
  };
}

export function addEntry(
  game: GameSession,
  playerId: string,
  categoryId: string,
  value: number,
  entryId: string,
): GameSession {
  const playerEntries = game.entries[playerId] ?? {};
  const categoryEntries = playerEntries[categoryId] ?? [];
  return {
    ...game,
    entries: {
      ...game.entries,
      [playerId]: {
        ...playerEntries,
        [categoryId]: [...categoryEntries, { id: entryId, value }],
      },
    },
    moveLog: [...game.moveLog, { playerId, categoryId, entryId }],
  };
}

export function removeEntry(
  game: GameSession,
  playerId: string,
  categoryId: string,
  entryId: string,
): GameSession {
  const playerEntries = game.entries[playerId];
  if (!playerEntries) return game;
  const categoryEntries = playerEntries[categoryId];
  if (!categoryEntries) return game;
  return {
    ...game,
    entries: {
      ...game.entries,
      [playerId]: {
        ...playerEntries,
        [categoryId]: categoryEntries.filter((entry) => entry.id !== entryId),
      },
    },
    moveLog: game.moveLog.filter((move) => move.entryId !== entryId),
  };
}

export function undoLastEntry(game: GameSession): GameSession {
  const last = game.moveLog[game.moveLog.length - 1];
  if (!last) return game;
  return removeEntry(game, last.playerId, last.categoryId, last.entryId);
}

export function finishGame(game: GameSession, nowIso: string): GameSession {
  return { ...game, finishedAt: nowIso };
}
