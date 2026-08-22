import { createTheme, type Theme } from '@mui/material/styles';

export function createAppTheme(mode: 'light' | 'dark'): Theme {
  return createTheme({
    palette: { mode },
    spacing: 6,
    typography: {
      fontSize: 13,
      h4: { fontSize: '1.7rem' },
      h5: { fontSize: '1.3rem' },
      h6: { fontSize: '1.05rem' },
      body1: { fontSize: '0.875rem' },
      body2: { fontSize: '0.8rem' },
      button: { fontSize: '0.8125rem' },
    },
    components: {
      MuiButton: { defaultProps: { size: 'small' } },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiIconButton: { defaultProps: { size: 'small' } },
      MuiSelect: { defaultProps: { size: 'small' } },
      MuiChip: { defaultProps: { size: 'small' } },
      MuiListItem: { defaultProps: { dense: true } },
    },
  });
}
