'use client';

import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { SingleAIChat } from '@/components/chat/SingleAIChat';
import { ChatSimulator } from '@/components/simulator/ChatSimulator';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { 
  Chat as ChatIcon, 
  Groups as GroupsIcon, 
  Psychology as PsychologyIcon 
} from '@mui/icons-material';

export default function Home() {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentModel, setCurrentModel] = useState('gpt-4o-mini');

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 0:
        return (
          <SingleAIChat 
            selectedAI={currentModel}
            modelConfig={null}
            onModelChange={setCurrentModel}
          />
        );
      case 1:
        return (
          <ChatSimulator 
            mode="multi" 
            selectedAI={currentModel} 
            modelConfig={null}
            onModelChange={setCurrentModel}
          />
        );
      case 2:
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            color: 'text.secondary'
          }}>
            Interactive Scene Mode (Coming Soon)
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Content Area */}
      <Box 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {renderCurrentTab()}
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={currentTab}
        onChange={(event, newValue) => setCurrentTab(newValue)}
        showLabels
        sx={{
          width: '100%',
          borderTop: 1,
          borderColor: 'divider',
          flexShrink: 0,
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
          label="Single AI Chat" 
          icon={<ChatIcon />} 
        />
        <BottomNavigationAction 
          label="Multi AI Chat" 
          icon={<GroupsIcon />} 
        />
        <BottomNavigationAction 
          label="Interactive Scene" 
          icon={<PsychologyIcon />} 
        />
      </BottomNavigation>
    </Box>
  );
} 