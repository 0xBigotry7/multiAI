"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from "@mui/material"
import { useTheme } from "next-themes"

interface ThemeWrapperProps {
  children: React.ReactNode
}

function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedTheme as 'light' | 'dark',
          ...(resolvedTheme === 'dark' ? {
            background: {
              default: '#09090b',
              paper: '#09090b',
            },
            primary: {
              main: '#2563eb',
              dark: '#1d4ed8',
              light: '#3b82f6',
              contrastText: '#fff',
            },
            secondary: {
              main: '#4b5563',
              dark: '#374151',
              light: '#6b7280',
              contrastText: '#fff',
            },
            text: {
              primary: '#f9fafb',
              secondary: '#e5e7eb',
            },
            divider: 'rgba(255, 255, 255, 0.1)',
          } : {
            background: {
              default: '#ffffff',
              paper: '#ffffff',
            },
          }),
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarColor: resolvedTheme === 'dark' ? '#374151 #1f2937' : undefined,
                '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                  borderRadius: '4px',
                  backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#cbd5e1',
                },
                '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
                  backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#f1f5f9',
                },
              },
            },
          },
          // ... rest of your theme components configuration
        },
      }),
    [resolvedTheme]
  )

  if (!mounted) {
    return null
  }

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeWrapper>{children}</ThemeWrapper>
    </NextThemesProvider>
  )
} 