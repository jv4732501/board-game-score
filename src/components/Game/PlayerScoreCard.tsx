import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { categorySubtotal } from '../../logic/template';
import type { Category, Player, ScoreEntry } from '../../logic/types';

export function PlayerScoreCard({
  player,
  categories,
  entriesByCategory,
  total,
  rank,
  onAddEntry,
  onRemoveEntry,
}: {
  player: Player;
  categories: Category[];
  entriesByCategory: Record<string, ScoreEntry[]>;
  total: number;
  rank: number;
  onAddEntry: (categoryId: string, value: number) => void;
  onRemoveEntry: (categoryId: string, entryId: string) => void;
}) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{player.name}</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip label={`Rank ${rank}`} />
            <Typography variant="h6">{total}</Typography>
          </Stack>
        </Stack>
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            entries={entriesByCategory[category.id] ?? []}
            onAddEntry={(value) => onAddEntry(category.id, value)}
            onRemoveEntry={(entryId) => onRemoveEntry(category.id, entryId)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function CategoryRow({
  category,
  entries,
  onAddEntry,
  onRemoveEntry,
}: {
  category: Category;
  entries: ScoreEntry[];
  onAddEntry: (value: number) => void;
  onRemoveEntry: (entryId: string) => void;
}) {
  const [value, setValue] = useState('');

  function handleAdd() {
    const parsed = Number(value);
    if (value.trim() === '' || Number.isNaN(parsed)) return;
    onAddEntry(parsed);
    setValue('');
  }

  return (
    <Box sx={{ mt: 1.5 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2">{category.name}</Typography>
        <Typography variant="body2">{categorySubtotal(entries)}</Typography>
      </Stack>
      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', mt: 0.5 }}>
        {entries.map((entry) => (
          <Stack key={entry.id} direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
            <Chip label={entry.value} />
            <IconButton
              size="small"
              aria-label={`Remove ${category.name} entry ${entry.value}`}
              onClick={() => onRemoveEntry(entry.id)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: 'center' }}>
        <TextField
          type="number"
          label={`Add to ${category.name}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{ width: 140 }}
        />
        <Button onClick={handleAdd}>Add</Button>
        {category.pointValue !== undefined && (
          <Button
            variant="outlined"
            aria-label={`Quick add ${category.pointValue} to ${category.name}`}
            onClick={() => onAddEntry(category.pointValue!)}
          >
            +{category.pointValue}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
