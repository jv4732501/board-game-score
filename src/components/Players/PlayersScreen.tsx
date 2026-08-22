import { useState, type Dispatch } from 'react';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { AppAction } from '../../hooks/useAppState';
import type { Player } from '../../logic/types';

export function PlayersScreen({
  players,
  dispatch,
}: {
  players: Player[];
  dispatch: Dispatch<AppAction>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#1976d2');

  function resetForm() {
    setEditingId(null);
    setName('');
    setColor('#1976d2');
  }

  function handleEdit(player: Player) {
    setEditingId(player.id);
    setName(player.name);
    setColor(player.color);
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({
      type: 'UPSERT_PLAYER',
      player: { id: editingId ?? crypto.randomUUID(), name: trimmed, color },
    });
    resetForm();
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Players
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField
          label="Color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          sx={{ width: 80 }}
        />
        <Button variant="contained" onClick={handleSave} disabled={!name.trim()}>
          {editingId ? 'Update Player' : 'Add Player'}
        </Button>
        {editingId && <Button onClick={resetForm}>Cancel</Button>}
      </Stack>
      {players.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No players yet. Add one above.
        </Typography>
      )}
      <List>
        {players.map((player) => (
          <ListItem
            key={player.id}
            secondaryAction={
              <Stack direction="row" spacing={0.5}>
                <IconButton aria-label={`Edit ${player.name}`} onClick={() => handleEdit(player)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label={`Delete ${player.name}`}
                  onClick={() => dispatch({ type: 'REMOVE_PLAYER', id: player.id })}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            }
          >
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: player.color, mr: 1 }} />
            <ListItemText primary={player.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
