import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatSimulator from './features/simulator/ChatSimulator';
import SingleAIChat from './features/chat/SingleAIChat';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { ChatHistoryItem } from './types/chat';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAI, setSelectedAI] = useState('');
  const [modelConfig] = useState(null);
  const [chatHistory] = useState<ChatHistoryItem[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleHistoryItemClick = (id: string) => {
    // TODO: Implement history item click handler
    console.log('History item clicked:', id);
  };

  const handleHistoryItemDelete = (id: string) => {
    // TODO: Implement history item delete handler
    console.log('History item delete:', id);
  };

  const handleAISelect = (ai: string) => {
    setSelectedAI(ai);
    setSidebarOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        pb: 7 // Add padding bottom to account for BottomNavigation
      }}>
        <Box sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          bgcolor: 'background.paper',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center'
        }}>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu"
            onClick={handleSidebarToggle}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        <Container 
          maxWidth="md" 
          sx={{ 
            py: 4, 
            mt: 6, // Add margin top to account for header
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {currentTab === 0 && (
            <SingleAIChat
              selectedAI={selectedAI}
              modelConfig={modelConfig}
            />
          )}
          {currentTab === 1 && (
            <ChatSimulator 
              mode="multi"
              selectedAI={selectedAI}
              modelConfig={modelConfig}
            />
          )}
          {currentTab === 2 && (
            <div>场景互动功能开发中...</div>
          )}
        </Container>

        <LeftSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          chatHistory={chatHistory}
          onHistoryItemClick={handleHistoryItemClick}
          onHistoryItemDelete={handleHistoryItemDelete}
          selectedAI={selectedAI}
          onAISelect={handleAISelect}
          modelConfig={modelConfig}
        />

        <BottomNavigation 
          value={currentTab} 
          onChange={handleTabChange}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App; 