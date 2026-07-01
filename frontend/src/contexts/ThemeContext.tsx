import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
  PaletteMode,
  Theme,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Builds an MUI theme with custom PMS branding colors.
 */
const buildTheme = (mode: PaletteMode): Theme =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#4f46e5', // Indigo
        light: '#818cf8',
        dark: '#3730a3',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#10b981', // Emerald
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff',
      },
      success: { main: '#10b981' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      info: { main: '#3b82f6' },
      background: {
        default: mode === 'dark' ? '#0b1120' : '#f8fafc',
        paper: mode === 'dark' ? '#111827' : '#ffffff',
      },
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2 },
      h2: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
      h3: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
      h4: { fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.3 },
      h5: { fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.4 },
      h6: { fontWeight: 600, lineHeight: 1.4 },
      subtitle1: { fontWeight: 600, letterSpacing: '0.01em', lineHeight: 1.5 },
      body1: { letterSpacing: '0.01em', lineHeight: 1.6 },
      body2: { letterSpacing: '0.01em', lineHeight: 1.6 },
      button: { fontWeight: 600, letterSpacing: '0.02em' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '10px',
            padding: '8px 20px',
            boxShadow: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(79, 70, 229, 0.15)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: '16px',
            boxShadow:
              mode === 'dark'
                ? '0 4px 20px -4px rgba(0, 0, 0, 0.4), 0 2px 8px -2px rgba(0, 0, 0, 0.2)'
                : '0 4px 20px -4px rgba(0, 0, 0, 0.05), 0 2px 8px -2px rgba(0, 0, 0, 0.02)',
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
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
      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'small' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { 
            fontWeight: 500,
            borderRadius: '6px',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '16px',
            boxShadow: mode === 'dark' 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)' 
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: mode === 'dark' ? 'rgba(11, 17, 32, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: 'none',
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            color: mode === 'dark' ? '#f8fafc' : '#0f172a',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: mode === 'dark' ? '#111827' : '#ffffff',
            borderRight: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          }
        }
      },
      // ── Additional overrides for consistent spacing, alignment, and
      // ── overflow handling across tables, forms, modals, and status labels.
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '24px',
            '&:last-child': { paddingBottom: '24px' },
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: { padding: '24px 24px 0' },
          title: { fontWeight: 700 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '12px 16px',
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 320,
          },
          head: {
            fontWeight: 700,
            fontSize: 12.5,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)',
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': { borderBottom: 'none' },
            transition: 'background-color 0.15s ease',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 6,
            padding: '6px 10px',
            backgroundColor: mode === 'dark' ? 'rgba(248,250,252,0.95)' : 'rgba(15,23,42,0.92)',
            color: mode === 'dark' ? '#0f172a' : '#ffffff',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            marginTop: 4,
            boxShadow: mode === 'dark'
              ? '0 12px 32px -8px rgba(0,0,0,0.6)'
              : '0 12px 32px -8px rgba(15,23,42,0.18)',
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 6px',
            fontSize: 14,
            minHeight: 40,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontSize: 14,
            alignItems: 'center',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: { fontWeight: 700, fontSize: 10.5 },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: { fontWeight: 700, fontSize: '1.15rem', padding: '20px 24px' },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: { padding: '8px 24px 20px' },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: { padding: '16px 24px', gap: 8 },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 8, height: 8 },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'background-color 0.15s ease',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { borderRadius: 3, height: 3 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, minHeight: 44 },
        },
      },
    },
  });

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(
    () => (localStorage.getItem('themeMode') as PaletteMode) || 'light'
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode must be used within ThemeProvider');
  return context;
};
