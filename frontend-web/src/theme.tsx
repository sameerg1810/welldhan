import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#2d7a47', light: '#4ade80', dark: '#1a4d2e' },
    secondary: { main: '#4ade80' },
    background: { default: '#0f1117', paper: '#1a1a2e' },
    error: { main: '#f44336' },
    success: { main: '#4ade80' },
    text: { primary: '#e8f5e9', secondary: '#81c784' },
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
        }),
        containedPrimary: ({ theme }) => ({
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#1a1a2e',
          border: '1px solid rgba(45,122,71,0.2)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#1a1a2e',
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': { borderColor: 'rgba(45,122,71,0.3)' },
            '&:hover fieldset': { borderColor: '#2d7a47' },
            '&.Mui-focused fieldset': { borderColor: '#4ade80' },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#0f1117',
          borderBottom: '1px solid rgba(45,122,71,0.2)',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#0f1117',
          borderRight: '1px solid rgba(45,122,71,0.2)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: { background: '#0f1117', borderTop: '1px solid rgba(45,122,71,0.2)' },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: 'rgba(45,122,71,0.2)' } },
    },
  },
});

export const sportColors: Record<string, string> = {
  Badminton: '#4ade80',
  Karate: '#f59e0b',
  Yoga: '#818cf8',
  Swimming: '#38bdf8',
  None: '#6b7280',
};

export default theme;
