import { useRef, useState, type Dispatch } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { buildBackup, mergeBackup, validateBackup, type AppState } from '../../logic/persistence';
import type { AppAction } from '../../hooks/useAppState';

export function SettingsScreen({
  state,
  dispatch,
}: {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}) {
  const [message, setMessage] = useState<{ severity: 'success' | 'error'; text: string } | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const backup = buildBackup(state, Date.now());
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `boardgamescore-backup-${backup.exportedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file: File) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setMessage({ severity: 'error', text: 'That file is not valid JSON.' });
      return;
    }
    const validated = validateBackup(parsed);
    if (!validated.ok) {
      setMessage({ severity: 'error', text: validated.reason });
      return;
    }
    const { state: merged, summary } = mergeBackup(state, validated.backup);
    dispatch({ type: 'IMPORT_MERGE', state: merged });
    setMessage({
      severity: 'success',
      text: `Imported ${summary.playersAdded} new / ${summary.playersUpdated} updated players, ${summary.templatesAdded} new / ${summary.templatesUpdated} updated templates, ${summary.gamesAdded} new / ${summary.gamesUpdated} updated games.${summary.gameSkipped ? ' In-progress game skipped (one is already active).' : ''}`,
    });
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleExport}>
          Export Backup
        </Button>
        <Button onClick={() => fileInputRef.current?.click()}>Import Backup</Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          hidden
          aria-label="Import Backup File"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImportFile(file);
            e.target.value = '';
          }}
        />
      </Stack>
      {message && <Alert severity={message.severity}>{message.text}</Alert>}
    </Box>
  );
}
