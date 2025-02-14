import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Paper } from '@mui/material';
import { SingleAIChat } from './features/chat/SingleAIChat';
import ChatSimulator from './features/simulator/ChatSimulator';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { 
  Chat as ChatIcon, 
  Groups as GroupsIcon, 
  Psychology as PsychologyIcon 
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: 'rgba(18, 18, 18, 0.8)',
    },
  },
  components: {
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(18, 18, 18, 0.8)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.5)',
          '&.Mui-selected': {
            color: '#90caf9',
          },
        },
      },
    },
  },
});

function App() {
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <Container 
          maxWidth="md" 
          sx={{ 
            py: 4,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            mb: 7 // Space for bottom navigation
          }}
        >
          {renderCurrentTab()}
        </Container>

        <Paper 
          elevation={0}
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            zIndex: 1000,
            background: 'transparent'
          }}
        >
          <BottomNavigation
            value={currentTab}
            onChange={(event, newValue) => setCurrentTab(newValue)}
            showLabels
            sx={{
              height: 65,
              '& .MuiBottomNavigationAction-root': {
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  color: 'rgba(255, 255, 255, 0.8)',
                },
                '&.Mui-selected': {
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
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default App; 