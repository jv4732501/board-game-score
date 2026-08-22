import { Box, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import type { HistoryEntry } from '../../logic/types';

export function HistoryScreen({
  history,
  onSelect,
}: {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
}) {
  const sorted = history.slice().sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        History
      </Typography>
      {sorted.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No finished games yet.
        </Typography>
      )}
      <List>
        {sorted.map((entry) => {
          const winners = entry.standings.filter((s) => s.rank === 1).map((s) => s.playerName);
          return (
            <ListItemButton key={entry.gameId} onClick={() => onSelect(entry)}>
              <ListItemText
                primary={`${entry.templateName} — ${entry.finishedAt.slice(0, 10)}`}
                secondary={`Players: ${entry.playerNames.join(', ')} · Winner: ${winners.join(', ')}`}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
