import { useState, type Dispatch } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { createGame } from '../../logic/game';
import { isResumable } from '../../logic/persistence';
import type { AppAction } from '../../hooks/useAppState';
import type { GameSession, Player, Template } from '../../logic/types';

export function HomeScreen({
  templates,
  players,
  game,
  dispatch,
  onStartGame,
  onResume,
}: {
  templates: Template[];
  players: Player[];
  game: GameSession | null;
  dispatch: Dispatch<AppAction>;
  onStartGame: (game: GameSession) => void;
  onResume: () => void;
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  function togglePlayer(id: string) {
    setSelectedPlayerIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function handleAddPlayer() {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    dispatch({ type: 'UPSERT_PLAYER', player: { id, name: trimmed, color: '#1976d2' } });
    setSelectedPlayerIds((ids) => [...ids, id]);
    setNewPlayerName('');
  }

  function handleStart() {
    const newGame = createGame(
      crypto.randomUUID(),
      selectedTemplateId,
      selectedPlayerIds,
      new Date().toISOString(),
    );
    onStartGame(newGame);
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Home
      </Typography>

      {isResumable(game) && (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={onResume}>
              Resume
            </Button>
          }
          sx={{ mb: 2 }}
        >
          You have a game in progress.
        </Alert>
      )}

      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <TextField
          select
          label="Template"
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
        >
          {templates.map((template) => (
            <MenuItem key={template.id} value={template.id}>
              {template.name}
            </MenuItem>
          ))}
        </TextField>

        <Typography variant="subtitle1">Players</Typography>
        {players.map((player) => (
          <FormControlLabel
            key={player.id}
            control={
              <Checkbox
                checked={selectedPlayerIds.includes(player.id)}
                onChange={() => togglePlayer(player.id)}
              />
            }
            label={player.name}
          />
        ))}

        <Stack direction="row" spacing={1}>
          <TextField
            label="New Player"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
          />
          <Button onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
            Add Player
          </Button>
        </Stack>

        <Button
          variant="contained"
          onClick={handleStart}
          disabled={!selectedTemplateId || selectedPlayerIds.length === 0}
        >
          Start Game
        </Button>
      </Stack>
    </Box>
  );
}
