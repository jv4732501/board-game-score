import { CssBaseline, ThemeProvider, Box, Typography } from '@mui/material';
import { createAppTheme } from '../theme';

export default function App() {
  return (
    <ThemeProvider theme={createAppTheme('light')}>
      <CssBaseline />
      <Box sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
        <Typography variant="h4">Board Game Score</Typography>
      </Box>
    </ThemeProvider>
  );
}
