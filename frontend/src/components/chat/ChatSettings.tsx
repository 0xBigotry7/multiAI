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
} from '@mui/material';
import { ChatSettingsProps } from '@/types';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

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
        Settings
      </Typography>

      <Box sx={{ mt: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={(e) => onDarkModeChange(e.target.checked)}
            />
          }
          label="Dark Mode"
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Language
        </Typography>
        <Select
          fullWidth
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          size="small"
        >
          {LANGUAGES.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              {lang.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Account
        </Typography>
        {isLoggedIn ? (
          <>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Signed in as {username}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={onLogout}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={onLogin}
            >
              Sign In
            </Button>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={onSignup}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}; 