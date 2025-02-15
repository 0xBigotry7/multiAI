'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Avatar,
} from '@mui/material';
import { ChatSettingsProps } from '@/types';
import { useTranslations } from 'next-intl';
import { languages, type Locale } from '@/lib/i18n';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Google as GoogleIcon, GitHub as GitHubIcon, Email as EmailIcon } from '@mui/icons-material';

export const ChatSettings: React.FC<ChatSettingsProps> = ({
  open,
  onClose,
  darkMode,
  onDarkModeChange,
  language,
  onLanguageChange,
  isLoggedIn,
  username,
}) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  const handleLanguageChange = (newLocale: Locale) => {
    onLanguageChange(newLocale);
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const handleLogin = async (provider?: string) => {
    try {
      await login(provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Render the drawer content only when it's open
  if (!open) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          p: 3,
        },
      }}
      keepMounted={false}
      SlideProps={{
        appear: true,
        mountOnEnter: true,
        unmountOnExit: true,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {t('settings.title')}
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('settings.appearance.title')}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={(e) => onDarkModeChange(e.target.checked)}
            />
          }
          label={t('settings.appearance.darkMode')}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            {t('settings.appearance.language')}
          </Typography>
          <Select
            fullWidth
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Locale)}
            size="small"
          >
            {Object.entries(languages).map(([code, name]) => (
              <MenuItem key={code} value={code}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {t('settings.account.title')}
        </Typography>
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={user?.image || undefined}
                sx={{ bgcolor: 'primary.main' }}
              >
                {(user?.name || t('chat.you')).charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle2">
                  {user?.name || t('chat.you')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                py: 1,
                textTransform: 'none',
              }}
            >
              {t('settings.account.signOut')}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              onClick={() => handleLogin('google')}
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<GoogleIcon />}
              sx={{ textTransform: 'none' }}
            >
              {t('settings.account.signInWithGoogle')}
            </Button>
            
            <Button
              onClick={() => handleLogin('github')}
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<GitHubIcon />}
              sx={{ textTransform: 'none' }}
            >
              {t('settings.account.signInWithGithub')}
            </Button>

            <Button
              onClick={() => handleLogin('email')}
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<EmailIcon />}
              sx={{ textTransform: 'none' }}
            >
              {t('settings.account.signInWithEmail')}
            </Button>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 2, 
                textAlign: 'center' 
              }}
            >
              {t('settings.account.signInMessage')}
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}; 