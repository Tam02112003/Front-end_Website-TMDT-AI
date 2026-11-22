import { createTheme } from '@mui/material/styles';

// TamStore design tokens — named after the shop's own switch/keycap colorways
// (Jade Axis switch, Camel keycap set) rather than generic brand colors.
export const colors = {
  bg: '#16181C',
  surface: '#1F2227',
  surfaceRaised: '#262A30',
  border: '#33373E',
  ink: '#ECEAE4',
  muted: '#8C9198',
  jade: '#3FA38C',
  jadeBright: '#55C2A8',
  camel: '#C9A25A',
  danger: '#E2695B',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: colors.bg,
      paper: colors.surface,
    },
    primary: {
      main: colors.jade,
      light: colors.jadeBright,
      contrastText: '#0D1210',
    },
    secondary: {
      main: colors.camel,
      contrastText: '#1A1409',
    },
    error: {
      main: colors.danger,
    },
    text: {
      primary: colors.ink,
      secondary: colors.muted,
    },
    divider: colors.border,
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Inter", system-ui, sans-serif',
    h1: { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, letterSpacing: '-0.01em' },
    h2: { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 },
    h4: { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 },
    h5: { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 },
    h6: { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 },
    button: { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.bg,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          backgroundImage: 'none',
          borderBottom: `1px solid ${colors.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
        containedPrimary: {
          color: '#0D1210',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"IBM Plex Mono", monospace',
          borderRadius: 4,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme;
