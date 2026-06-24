// Custom theme configuration for DMS (Dormitory Management System)

export const getTheme = (mode) => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          // Modern Deep Space/Indigo theme
          primary: {
            main: '#6366F1', // Indigo
            light: '#818CF8',
            dark: '#4F46E5',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#8B5CF6', // Violet
            light: '#A78BFA',
            dark: '#7C3AED',
            contrastText: '#FFFFFF',
          },
          background: {
            default: '#0B0F19', // Deep dark slate
            paper: '#111827',   // Dark gray-slate
          },
          text: {
            primary: '#F9FAFB',
            secondary: '#9CA3AF',
            disabled: '#6B7280',
          },
          divider: 'rgba(255, 255, 255, 0.08)',
          action: {
            hover: 'rgba(99, 102, 241, 0.08)',
            selected: 'rgba(99, 102, 241, 0.16)',
          },
        }
      : {
          // Premium Light theme
          primary: {
            main: '#4F46E5', // Indigo
            light: '#6366F1',
            dark: '#3730A3',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#7C3AED', // Violet
            light: '#8B5CF6',
            dark: '#6D28D9',
            contrastText: '#FFFFFF',
          },
          background: {
            default: '#F8FAFC', // Slate gray background
            paper: '#FFFFFF',   // Pure white card
          },
          text: {
            primary: '#0F172A', // Deep slate
            secondary: '#475569',
            disabled: '#94A3B8',
          },
          divider: 'rgba(15, 23, 42, 0.08)',
          action: {
            hover: 'rgba(79, 70, 229, 0.04)',
            selected: 'rgba(79, 70, 229, 0.08)',
          },
        }),
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontWeight: 650,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)',
    '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
    '0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -2px rgba(0,0,0,0.04)',
    '0 20px 25px -5px rgba(0,0,0,0.07), 0 10px 10px -5px rgba(0,0,0,0.04)',
    // populate remaining shadows with smooth styles
    ...Array(20).fill('0 25px 50px -12px rgba(0,0,0,0.08)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          transition: 'all 0.2s ease-in-out',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
        containedSecondary: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[2],
          backgroundImage: 'none',
          ...(theme.palette.mode === 'dark' && {
            background: 'linear-gradient(145deg, #111827 0%, #1F2937 100%)',
            backdropFilter: 'blur(20px)',
          }),
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.02)',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)',
          },
          '&.Mui-focused': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : '#fff',
          },
        }),
      },
    },
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          scrollbarColor: theme.palette.mode === 'dark' ? '#2d3748 #1a202c' : '#cbd5e1 #f8fafc',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.mode === 'dark' ? '#0B0F19' : '#F8FAFC',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark' ? '#1F2937' : '#CBD5E1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.mode === 'dark' ? '#374151' : '#94A3B8',
          },
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          transition: 'background-color 0.3s ease, color 0.3s ease',
        },
      }),
    },
  },
});
