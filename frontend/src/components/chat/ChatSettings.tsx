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
import { useAuthCore } from '@particle-network/auth-core-modal';
import { ChatSettingsProps } from '@/types';
import { useTranslations } from 'next-intl';
import { languages, type Locale } from '@/lib/i18n';
import { useRouter, usePathname } from 'next/navigation';

export const ChatSettings: React.FC<ChatSettingsProps> = ({
  open,
  onClose,
  darkMode,
  onDarkModeChange,
  language,
  onLanguageChange,
  isLoggedIn,
  username,
  onLogin,
  onSignup,
  onLogout,
}) => {
  const t = useTranslations();
  const authCore = useAuthCore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    // Update the local state
    onLanguageChange(newLocale);
    
    // Get the current path segments
    const segments = pathname.split('/');
    
    // Replace the locale segment (should be the first one after the initial slash)
    segments[1] = newLocale;
    
    // Construct the new path
    const newPath = segments.join('/');
    
    // Navigate to the new locale path
    router.push(newPath);
  };

  const handleConnect = async () => {
    try {
      // First try to get existing user info
      if (authCore.userInfo) {
        console.log('Already connected:', authCore.userInfo);
        onLogin();
        return;
      }

      // If not connected, open the security modal
      await authCore.openAccountAndSecurity();
      
      // Check if connection was successful
      if (authCore.userInfo) {
        console.log('Connection successful:', authCore.userInfo);
        onLogin();
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      onLogout();
      window.location.reload(); // Refresh to clear any cached state
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
    >
      <Typography variant="h6" gutterBottom>
        {t('settings.title')}
      </Typography>

      <Box sx={{ mt: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={(e) => onDarkModeChange(e.target.checked)}
            />
          }
          label={t('settings.darkMode')}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('settings.language')}
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

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {t('settings.account')}
        </Typography>
        {isLoggedIn ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {(username || t('chat.you')).charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle2">
                  {username || t('chat.you')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connected with Particle
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
              {t('settings.disconnect')}
            </Button>
          </Box>
        ) : (
          <Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleConnect}
              sx={{
                borderRadius: 2,
                py: 1,
                textTransform: 'none',
              }}
            >
              {t('settings.connect')}
            </Button>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 2, 
                textAlign: 'center' 
              }}
            >
              {t('settings.connectMessage')}
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}; 