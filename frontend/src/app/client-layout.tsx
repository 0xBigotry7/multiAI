'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const ParticleAuthProvider = dynamic(
  () => import('@/providers/particle-provider'),
  { 
    ssr: false,
    loading: () => null
  }
) as any;

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                ...(resolvedTheme === 'dark' && {
                  backgroundColor: '#09090b',
                  backgroundImage: 'none',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                }),
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                ...(resolvedTheme === 'dark' && {
                  backgroundColor: '#09090b',
                  backgroundImage: 'none',
                  borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                }),
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                ...(resolvedTheme === 'dark' && {
                  backgroundColor: '#09090b',
                  backgroundImage: 'none',
                }),
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: {
                ...(resolvedTheme === 'dark' && {
                  backgroundColor: '#1f2937',
                }),
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: '0.5rem',
                ...(resolvedTheme === 'dark' && {
                  '&.MuiButton-contained': {
                    backgroundColor: '#2563eb',
                    '&:hover': {
                      backgroundColor: '#1d4ed8',
                    },
                  },
                  '&.MuiButton-outlined': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  },
                  '&.MuiButton-text': {
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  },
                }),
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                ...(resolvedTheme === 'dark' && {
                  color: '#e5e7eb',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }),
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                ...(resolvedTheme === 'dark' && {
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2563eb',
                    },
                  },
                }),
              },
            },
          },
          MuiSelect: {
            styleOverrides: {
              root: {
                ...(resolvedTheme === 'dark' && {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2563eb',
                  },
                }),
              },
            },
          },
          MuiListItem: {
            styleOverrides: {
              root: {
                ...(resolvedTheme === 'dark' && {
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.2)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }),
              },
            },
          },
          MuiListSubheader: {
            styleOverrides: {
              root: {
                ...(resolvedTheme === 'dark' && {
                  backgroundColor: '#09090b',
                  color: '#9ca3af',
                }),
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                ...(resolvedTheme === 'dark' && {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }),
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              root: {
                ...(resolvedTheme === 'dark' && {
                  '& .MuiSwitch-track': {
                    backgroundColor: '#4b5563',
                  },
                  '& .MuiSwitch-thumb': {
                    backgroundColor: '#e5e7eb',
                  },
                  '&.Mui-checked': {
                    '& .MuiSwitch-track': {
                      backgroundColor: '#2563eb !important',
                    },
                    '& .MuiSwitch-thumb': {
                      backgroundColor: '#ffffff',
                    },
                  },
                }),
              },
            },
          },
        },
      }),
    [resolvedTheme]
  );

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ParticleAuthProvider>
        <ThemeWrapper>
          <main className="min-h-screen bg-background">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 max-w-screen-2xl items-center">
                {/* Add your header content here */}
              </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 bg-background">
              {children}
            </div>

            {/* Bottom Navigation Bar */}
            <footer className="sticky bottom-0 z-50 w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 max-w-screen-2xl items-center">
                {/* Add your footer content here */}
              </div>
            </footer>
          </main>
        </ThemeWrapper>
      </ParticleAuthProvider>
    </NextThemesProvider>
  );
} 