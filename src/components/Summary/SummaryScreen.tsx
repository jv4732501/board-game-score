import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { HistoryEntry } from '../../logic/types';

export function SummaryScreen({ entry, onDone }: { entry: HistoryEntry; onDone: () => void }) {
  const categoryNames = entry.standings[0]?.categoryTotals.map((c) => c.categoryName) ?? [];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {entry.templateName} — Final Standings
      </Typography>

      <Table size="small" sx={{ mb: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Rank</TableCell>
            <TableCell>Player</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entry.standings.map((row) => (
            <TableRow key={row.playerId}>
              <TableCell>{row.rank}</TableCell>
              <TableCell>{row.playerName}</TableCell>
              <TableCell align="right">{row.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="subtitle1" gutterBottom>
        Category Breakdown
      </Typography>
      <Table size="small" sx={{ mb: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            {categoryNames.map((name) => (
              <TableCell key={name} align="right">
                {name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {entry.standings.map((row) => (
            <TableRow key={row.playerId}>
              <TableCell>{row.playerName}</TableCell>
              {row.categoryTotals.map((ct) => (
                <TableCell key={ct.categoryId} align="right">
                  {ct.total}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button variant="contained" onClick={onDone}>
        Done
      </Button>
    </Box>
  );
}
