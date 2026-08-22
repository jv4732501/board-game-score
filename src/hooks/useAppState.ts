import { useEffect, useReducer, type Dispatch } from 'react';
import {
  addEntry as addGameEntry,
  removeEntry as removeGameEntry,
  undoLastEntry,
} from '../logic/game';
import { deserialize, serialize, type AppState } from '../logic/persistence';
import type { GameSession, HistoryEntry, Player, Template } from '../logic/types';

const STORAGE_KEY = 'boardgamescore.state.v1';

const EMPTY_STATE: AppState = { players: [], templates: [], game: null, history: [] };

export type AppAction =
  | { type: 'UPSERT_PLAYER'; player: Player }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'UPSERT_TEMPLATE'; template: Template }
  | { type: 'REMOVE_TEMPLATE'; id: string }
  | { type: 'START_GAME'; game: GameSession }
  | { type: 'ADD_ENTRY'; playerId: string; categoryId: string; value: number; entryId: string }
  | { type: 'REMOVE_ENTRY'; playerId: string; categoryId: string; entryId: string }
  | { type: 'UNDO_LAST_ENTRY' }
  | { type: 'FINISH_GAME'; nowIso: string; historyEntry: HistoryEntry }
  | { type: 'IMPORT_MERGE'; state: AppState };

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const arr = list.slice();
  const i = arr.findIndex((x) => x.id === item.id);
  if (i >= 0) arr[i] = item;
  else arr.push(item);
  return arr;
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'UPSERT_PLAYER':
      return { ...state, players: upsertById(state.players, action.player) };
    case 'REMOVE_PLAYER':
      return { ...state, players: state.players.filter((p) => p.id !== action.id) };
    case 'UPSERT_TEMPLATE':
      return { ...state, templates: upsertById(state.templates, action.template) };
    case 'REMOVE_TEMPLATE':
      return { ...state, templates: state.templates.filter((t) => t.id !== action.id) };
    case 'START_GAME':
      return { ...state, game: action.game };
    case 'ADD_ENTRY': {
      if (!state.game) return state;
      const game = addGameEntry(
        state.game,
        action.playerId,
        action.categoryId,
        action.value,
        action.entryId,
      );
      return { ...state, game };
    }
    case 'REMOVE_ENTRY': {
      if (!state.game) return state;
      const game = removeGameEntry(state.game, action.playerId, action.categoryId, action.entryId);
      return { ...state, game };
    }
    case 'UNDO_LAST_ENTRY': {
      if (!state.game) return state;
      return { ...state, game: undoLastEntry(state.game) };
    }
    case 'FINISH_GAME':
      return { ...state, game: null, history: [...state.history, action.historyEntry] };
    case 'IMPORT_MERGE':
      return action.state;
    default:
      return state;
  }
}

function loadInitialState(): AppState {
  return deserialize<AppState>(localStorage.getItem(STORAGE_KEY)) ?? EMPTY_STATE;
}

export function useAppState(): { state: AppState; dispatch: Dispatch<AppAction> } {
  const [state, dispatch] = useReducer(appReducer, undefined, loadInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, serialize(state));
  }, [state]);

  return { state, dispatch };
}
