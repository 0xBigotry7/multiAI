'use client';

import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Menu as MenuIcon,
  Chat as ChatIcon, 
  Groups as GroupsIcon, 
  Psychology as PsychologyIcon 
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { ChatSettings } from '../chat/ChatSettings';
import { ChatHistory } from '../chat/ChatHistory';
import { useTheme } from '@/lib/hooks/use-theme';
import { useTranslations } from 'next-intl';
import { type Locale } from '@/lib/i18n';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/lib/hooks/use-chat';

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const { mode: themeMode, setThemeMode } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>('en');
  const { user, isAuthenticated } = useAuth();
  const { 
    sessions,
    sessionId,
    createNewSession,
    loadSession,
    deleteSession,
  } = useChat();

  // Load preferred language on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('preferred_language');
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'zh')) {
      setLocale(savedLocale as Locale);
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

  const handleNewChat = () => {
    createNewSession('gpt-4-0125-preview');
    setHistoryOpen(false);
  };

  const handleSessionSelect = (id: string) => {
    loadSession(id);
    setHistoryOpen(false);
  };

  const handleSessionDelete = (id: string) => {
    deleteSession(id);
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
      <Box
        component="header"
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
          backdropFilter: 'blur(8px)',
          backgroundColor: themeMode === 'dark' 
            ? 'rgba(9, 9, 11, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="primary"
            onClick={() => isAuthenticated && setHistoryOpen(true)}
            disabled={!isAuthenticated}
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
      </Box>

      {/* Main Content */}
      <Box
        component="main"
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
          backdropFilter: 'blur(8px)',
          backgroundColor: themeMode === 'dark' 
            ? 'rgba(9, 9, 11, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
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

      {/* Drawers */}
      <ChatSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={themeMode === 'dark'}
        onDarkModeChange={handleDarkModeChange}
        language={locale}
        onLanguageChange={handleLanguageChange}
        isLoggedIn={isAuthenticated}
        username={user?.email || user?.name || t('chat.you')}
      />

      {isAuthenticated && (
        <ChatHistory
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          sessions={sessions}
          currentSessionId={sessionId}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
          onDeleteSession={handleSessionDelete}
        />
      )}
    </Box>
  );
} 