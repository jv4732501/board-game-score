import { useState, type Dispatch } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
  const [scoringReferenceOpen, setScoringReferenceOpen] = useState(false);
  const hasScoringReference = (template.scoringReference?.length ?? 0) > 0;

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
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Typography variant="h5">{template.name}</Typography>
          {hasScoringReference && (
            <IconButton
              aria-label="Scoring Reference"
              onClick={() => setScoringReferenceOpen(true)}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
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
      {hasScoringReference && (
        <Dialog open={scoringReferenceOpen} onClose={() => setScoringReferenceOpen(false)}>
          <DialogTitle>Scoring Reference</DialogTitle>
          <DialogContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {template.scoringReference!.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell align="right">{row.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScoringReferenceOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
