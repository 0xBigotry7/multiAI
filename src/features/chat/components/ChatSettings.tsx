import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Switch,
  Select,
  MenuItem,
  Button,
  IconButton,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  Language as LanguageIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface ChatSettingsProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
  onDarkModeChange: (isDark: boolean) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
  username?: string;
}

const LANGUAGES = {
  'en': 'English',
  'zh': '中文',
  'es': 'Español'
};

export const ChatSettings: React.FC<ChatSettingsProps> = ({
  open,
  onClose,
  darkMode,
  onDarkModeChange,
  language,
  onLanguageChange,
  isLoggedIn,
  onLogin,
  onSignup,
  onLogout,
  username,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          bgcolor: 'background.paper',
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Settings</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* User Section */}
      <List>
        {isLoggedIn ? (
          <>
            <ListItem>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText 
                primary={username}
                secondary="Logged in"
              />
              <Button
                variant="outlined"
                color="primary"
                startIcon={<LogoutIcon />}
                onClick={onLogout}
                size="small"
              >
                Logout
              </Button>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem>
              <ListItemText 
                primary="Account"
                secondary="Login or create an account"
              />
            </ListItem>
            <ListItem sx={{ gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<LoginIcon />}
                onClick={onLogin}
                fullWidth
              >
                Login
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<PersonIcon />}
                onClick={onSignup}
                fullWidth
              >
                Sign Up
              </Button>
            </ListItem>
          </>
        )}
      </List>

      <Divider />

      {/* Settings Section */}
      <List>
        <ListItem>
          <ListItemIcon>
            <DarkModeIcon />
          </ListItemIcon>
          <ListItemText primary="Dark Mode" />
          <Switch
            edge="end"
            checked={darkMode}
            onChange={(e) => onDarkModeChange(e.target.checked)}
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <LanguageIcon />
          </ListItemIcon>
          <FormControl fullWidth>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              label="Language"
              onChange={(e) => onLanguageChange(e.target.value)}
              size="small"
            >
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <MenuItem key={code} value={code}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ListItem>
      </List>

      <Divider />

      {/* Version Info */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Version 1.0.0
        </Typography>
      </Box>
    </Drawer>
  );
}; 