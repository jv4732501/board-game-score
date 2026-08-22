import type { Dispatch } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { computeStandings } from '../../logic/template';
import { PlayerScoreCard } from './PlayerScoreCard';
import type { AppAction } from '../../hooks/useAppState';
import type { GameSession, HistoryEntry, Player, Template } from '../../logic/types';

export function GameScreen({
  game,
  template,
  players,
  dispatch,
  onFinish,
}: {
  game: GameSession;
  template: Template;
  players: Player[];
  dispatch: Dispatch<AppAction>;
  onFinish: (entry: HistoryEntry) => void;
}) {
  const standings = computeStandings(template, game, players);

  function handleFinish() {
    const nowIso = new Date().toISOString();
    const historyEntry: HistoryEntry = {
      gameId: game.id,
      templateName: template.name,
      playerNames: game.playerIds.map(
        (id) => players.find((p) => p.id === id)?.name ?? 'Unknown Player',
      ),
      finishedAt: nowIso,
      standings,
    };
    dispatch({ type: 'FINISH_GAME', nowIso, historyEntry });
    onFinish(historyEntry);
  }

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
      >
        <Typography variant="h5">{template.name}</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => dispatch({ type: 'UNDO_LAST_ENTRY' })}
            disabled={game.moveLog.length === 0}
          >
            Undo
          </Button>
          <Button variant="contained" onClick={handleFinish}>
            End Game
          </Button>
        </Stack>
      </Stack>
      {game.playerIds.map((playerId) => {
        const player = players.find((p) => p.id === playerId);
        if (!player) return null;
        const row = standings.find((s) => s.playerId === playerId)!;
        return (
          <PlayerScoreCard
            key={playerId}
            player={player}
            categories={template.categories}
            entriesByCategory={game.entries[playerId] ?? {}}
            total={row.total}
            rank={row.rank}
            onAddEntry={(categoryId, value) =>
              dispatch({
                type: 'ADD_ENTRY',
                playerId,
                categoryId,
                value,
                entryId: crypto.randomUUID(),
              })
            }
            onRemoveEntry={(categoryId, entryId) =>
              dispatch({ type: 'REMOVE_ENTRY', playerId, categoryId, entryId })
            }
          />
        );
      })}
    </Box>
  );
}
