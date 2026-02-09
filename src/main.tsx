import React, { useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { alpha } from '@mui/material/styles'
import App from './App'

type ThemeMode = 'light' | 'dark'
const THEME_STORAGE_KEY = 'app-theme-mode'

function getInitialThemeMode(): ThemeMode {
  const savedMode = localStorage.getItem(THEME_STORAGE_KEY)
  return savedMode === 'dark' ? 'dark' : 'light'
}

export function Root() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)

  const theme = useMemo(
    () => {
      const colorTokens =
        themeMode === 'light'
          ? {
              primary: '#0A7C66',
              secondary: '#C8553D',
              backgroundDefault: '#F4F3EE',
              backgroundPaper: '#FFFCF7',
              textPrimary: '#1F2A30',
              textSecondary: '#55616A',
              divider: 'rgba(31, 42, 48, 0.14)',
            }
          : {
              primary: '#54C6A9',
              secondary: '#FF8F70',
              backgroundDefault: '#0F1418',
              backgroundPaper: '#182127',
              textPrimary: '#E5EEF2',
              textSecondary: '#A4B3BC',
              divider: 'rgba(164, 179, 188, 0.24)',
            }

      return createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: colorTokens.primary,
          },
          secondary: {
            main: colorTokens.secondary,
          },
          background: {
            default: colorTokens.backgroundDefault,
            paper: colorTokens.backgroundPaper,
          },
          text: {
            primary: colorTokens.textPrimary,
            secondary: colorTokens.textSecondary,
          },
          divider: colorTokens.divider,
        },
        spacing: 8,
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h3: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
          },
        },
        components: {
          MuiTextField: {
            defaultProps: {
              variant: 'outlined',
              fullWidth: true,
              margin: 'normal',
            },
          },
          MuiButton: {
            defaultProps: {
              variant: 'contained',
            },
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 10,
                transition:
                  'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 10px 20px ${alpha(colorTokens.primary, 0.24)}`,
                },
                '&:focus-visible': {
                  outline: `3px solid ${alpha(colorTokens.primary, 0.35)}`,
                  outlineOffset: 2,
                },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                transition: 'background-color 180ms ease, transform 180ms ease',
                '&:hover': {
                  backgroundColor: alpha(colorTokens.primary, 0.12),
                  transform: 'translateY(-1px)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                border: `1px solid ${colorTokens.divider}`,
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(colorTokens.primary, themeMode === 'light' ? 0.24 : 0.4),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(colorTokens.primary, themeMode === 'light' ? 0.7 : 0.85),
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colorTokens.primary,
                  borderWidth: 2,
                },
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                '&.Mui-focused': {
                  color: colorTokens.primary,
                },
              },
            },
          },
        },
      })
    },
    [themeMode],
  )

  const toggleTheme = () => {
    setThemeMode((previousMode) => {
      const nextMode: ThemeMode = previousMode === 'light' ? 'dark' : 'light'
      localStorage.setItem(THEME_STORAGE_KEY, nextMode)
      return nextMode
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
      />
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
