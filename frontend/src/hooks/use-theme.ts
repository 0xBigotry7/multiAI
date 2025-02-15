import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const { theme, setTheme } = useNextTheme();

  return {
    mode: theme as 'light' | 'dark',
    setThemeMode: (mode: 'light' | 'dark') => setTheme(mode),
  };
} 