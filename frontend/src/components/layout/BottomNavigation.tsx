import React from 'react';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Chat as ChatIcon, Group as GroupIcon, SportsEsports as GamesIcon } from '@mui/icons-material';

export interface BottomNavigationProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ value, onChange }) => {
  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 1000,
        borderTop: '1px solid rgba(255, 255, 255, 0.12)'
      }} 
      elevation={3}
    >
      <MuiBottomNavigation
        value={value}
        onChange={onChange}
        showLabels
        sx={{
          bgcolor: 'background.paper',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main'
            }
          }
        }}
      >
        <BottomNavigationAction 
          label="单AI对话" 
          icon={<ChatIcon />} 
          sx={{ 
            '&.Mui-selected': {
              '& .MuiSvgIcon-root': { color: 'primary.main' }
            }
          }}
        />
        <BottomNavigationAction 
          label="多AI对话" 
          icon={<GroupIcon />}
          sx={{ 
            '&.Mui-selected': {
              '& .MuiSvgIcon-root': { color: 'primary.main' }
            }
          }}
        />
        <BottomNavigationAction 
          label="场景互动" 
          icon={<GamesIcon />}
          sx={{ 
            '&.Mui-selected': {
              '& .MuiSvgIcon-root': { color: 'primary.main' }
            }
          }}
        />
      </MuiBottomNavigation>
    </Paper>
  );
}; 