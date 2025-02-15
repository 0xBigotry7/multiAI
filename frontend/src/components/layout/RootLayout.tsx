'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, IconButton, Typography, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Settings as SettingsIcon, Menu as MenuIcon, Chat as ChatIcon, Groups as GroupsIcon, Psychology as PsychologyIcon } from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { ChatSettings } from '../chat/ChatSettings';
import { useTheme } from '@/lib/hooks/use-theme';
import { useTranslations } from 'next-intl';
import { type Locale } from '@/lib/i18n';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const { mode: themeMode, setThemeMode } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>('en');

  // Load preferred language on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('preferred_language');
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'zh')) {
      setLocale(savedLocale as Locale);
    } else {
      // If no saved preference, use browser language
      const browserLang = navigator.language.toLowerCase().split('-')[0];
      const newLocale = browserLang === 'zh' ? 'zh' : 'en';
      setLocale(newLocale);
      localStorage.setItem('preferred_language', newLocale);
    }
  }, []);

  // Determine current tab based on pathname
  const getCurrentTab = () => {
    if (pathname.includes('/simulator')) return 1;
    if (pathname.includes('/scene')) return 2;
    return 0;
  };

  const handleTabChange = (event: any, newValue: number) => {
    switch (newValue) {
      case 0: // Single AI Chat
        router.push(`/${locale}/chat`);
        break;
      case 1: // Multi AI Chat
        router.push(`/${locale}/simulator`);
        break;
      case 2: // Interactive Scene
        router.push(`/${locale}/scene`);
        break;
    }
  };

  const handleDarkModeChange = (isDark: boolean) => {
    setThemeMode(isDark ? 'dark' : 'light');
  };

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('preferred_language', newLocale);
    
    // Update the URL with the new locale
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar */}
      <Paper 
        elevation={0}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          width: '100%',
          zIndex: 10,
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="primary"
            onClick={() => {}}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Multi-AI Chat
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="primary"
            onClick={() => setSettingsOpen(true)}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          pt: '72px', // Height of top bar
          pb: '56px', // Height of bottom navigation
          overflow: 'auto',
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={getCurrentTab()}
        onChange={handleTabChange}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: 1,
          borderColor: 'divider',
          width: '100%',
          height: '56px',
          zIndex: 10,
          bgcolor: 'background.default',
          '& .MuiBottomNavigationAction-root': {
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              color: 'text.secondary',
            },
            '&.Mui-selected': {
              color: 'primary.main',
              '& .MuiSvgIcon-root': {
                transform: 'scale(1.1)',
              },
            },
          },
        }}
      >
        <BottomNavigationAction 
          label={t('chat.singleAIChat')}
          icon={<ChatIcon />} 
        />
        <BottomNavigationAction 
          label={t('chat.multiAIChat')}
          icon={<GroupsIcon />} 
        />
        <BottomNavigationAction 
          label={t('chat.interactiveScene')}
          icon={<PsychologyIcon />} 
        />
      </BottomNavigation>

      {/* Settings Drawer */}
      <ChatSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={themeMode === 'dark'}
        onDarkModeChange={handleDarkModeChange}
        language={locale}
        onLanguageChange={handleLanguageChange}
        isLoggedIn={false}
        username={t('chat.you')}
        onLogin={() => {}}
        onSignup={() => {}}
        onLogout={() => {}}
      />
    </Box>
  );
} 