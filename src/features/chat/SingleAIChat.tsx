import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Alert, IconButton, Typography, CircularProgress, Drawer, Select, MenuItem, ListSubheader, FormControl } from '@mui/material';
import { Settings as SettingsIcon, Menu as MenuIcon } from '@mui/icons-material';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatSettings } from './components/ChatSettings';
import { ChatHistory } from './components/ChatHistory';
import { useChat } from './hooks/useChat';
import { Message } from '../../types/chat';
import { useTheme } from '@/hooks/use-theme';

// Add model options
const AVAILABLE_MODELS = {
  'OpenAI': [
    'gpt-4-0125-preview',
    'gpt-4',
    'gpt-3.5-turbo-0125',
  ],
  'DeepSeek': [
    'deepseek-chat',
    'deepseek-coder',
  ]
};

interface SingleAIChatProps {
  selectedAI: string;
  modelConfig: any;
  onModelChange: (model: string) => void;
}

export const SingleAIChat: React.FC<SingleAIChatProps> = ({ 
  selectedAI, 
  modelConfig,
  onModelChange 
}) => {
  const { mode: themeMode, setThemeMode } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get provider and model name for display
  const getModelDisplay = (modelId: string) => {
    for (const [provider, models] of Object.entries(AVAILABLE_MODELS)) {
      if (models.includes(modelId)) {
        return `${provider} / ${modelId}`;
      }
    }
    return modelId;
  };

  const {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    error,
    isConnected,
    sendMessage,
    stopGeneration,
    setError,
    sessions,
    sessionId,
    createNewSession,
    loadSession,
    deleteSession,
    isTypingResponse,
    selectedModel,
    setSelectedModel
  } = useChat({
    onTypingStart: () => {},
    onTypingEnd: () => {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  });

  const handleModelChange = (model: string) => {
    if (model === selectedAI) return;
    onModelChange(model);
    setSelectedModel(model);
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    if (!sessionId) {
      createNewSession(selectedAI);
    }
    setShowEmojiPicker(false);
    await sendMessage(inputMessage);
  };

  const handleNewChat = () => {
    createNewSession(selectedAI);
    setHistoryOpen(false);
    setInputMessage('');
  };

  const handleSessionSelect = (id: string) => {
    loadSession(id);
    setHistoryOpen(false);
    setInputMessage('');
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleDarkModeChange = (isDark: boolean) => {
    setThemeMode(isDark ? 'dark' : 'light');
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    // TODO: Implement language change logic
  };

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log('Login clicked');
  };

  const handleSignup = () => {
    // TODO: Implement signup logic
    console.log('Signup clicked');
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    setIsLoggedIn(false);
    setUsername(undefined);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Display welcome message only when there are no messages and no active session
  const displayMessages = messages.length > 0 || sessionId ? messages : [{
    role: 'assistant' as const,
    content: `👋 Hi there! I'm your AI assistant powered by ${getModelDisplay(selectedAI)}. How can I help you today?`,
    timestamp: new Date()
  }];

  return (
    <Box 
      sx={{ 
        height: '100vh',
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      {/* Fixed Top Nav */}
      <Box 
        sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: 10,
        }}
      >
        <Box 
          sx={{ 
            height: '100%',
            px: { xs: 1, sm: 2 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
          }}
        >
          <IconButton
            color="primary"
            onClick={() => setHistoryOpen(true)}
            sx={{ flexShrink: 0 }}
          >
            <MenuIcon />
          </IconButton>

          <FormControl 
            sx={{ 
              flexGrow: 1,
              maxWidth: 400,
              minWidth: 120,
            }}
          >
            <Select
              value={selectedAI}
              onChange={(e) => handleModelChange(e.target.value)}
              IconComponent={() => null}
              sx={{
                '.MuiSelect-select': {
                  py: 1,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  textAlign: 'center',
                  paddingRight: '14px !important',
                },
                '&.MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    border: 'none',
                  },
                },
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                borderRadius: 1,
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: '60vh',
                    mt: 1,
                    boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
                    borderRadius: 2,
                  }
                },
                transformOrigin: { horizontal: 'center', vertical: 'top' },
                anchorOrigin: { horizontal: 'center', vertical: 'bottom' },
              }}
              renderValue={(value) => (
                <Typography
                  sx={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    fontWeight: 500,
                  }}
                >
                  {getModelDisplay(value as string)}
                </Typography>
              )}
            >
              {Object.entries(AVAILABLE_MODELS).map(([provider, models]) => [
                <ListSubheader 
                  key={provider}
                  sx={{ 
                    bgcolor: 'background.paper',
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    fontWeight: 600,
                    lineHeight: '32px',
                    color: 'primary.main',
                  }}
                >
                  {provider}
                </ListSubheader>,
                ...models.map(model => (
                  <MenuItem 
                    key={model} 
                    value={model}
                    sx={{
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                      py: 1.5,
                      pl: 3,
                      '&.Mui-selected': {
                        bgcolor: 'primary.dark',
                        color: 'primary.contrastText',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {model}
                  </MenuItem>
                ))
              ]).flat()}
            </Select>
          </FormControl>

          <IconButton
            color="primary"
            onClick={() => setSettingsOpen(true)}
            sx={{ flexShrink: 0 }}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ 
            position: 'fixed',
            top: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 11,
            maxWidth: '90%'
          }}
        >
          {error}
        </Alert>
      )}

      {/* Scrollable Messages Area */}
      <Box 
        sx={{ 
          position: 'fixed',
          top: '64px',
          bottom: '120px',
          left: 0,
          right: 0,
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            width: '8px',
            display: { xs: 'none', sm: 'block' },
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
          },
        }}
      >
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: { xs: 1.5, sm: 2 },
          }}
        >
          {displayMessages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              isTyping={isTypingResponse && index === messages.length - 1 && message.role === 'assistant'}
            />
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mt: 2 }}>
              <CircularProgress size={16} />
              <Typography>AI is thinking...</Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Fixed Input Area */}
      <Box 
        sx={{ 
          position: 'fixed',
          bottom: '56px',
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          zIndex: 10,
        }}
      >
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          <ChatInput
            value={inputMessage}
            onChange={setInputMessage}
            onSend={handleSend}
            onStop={stopGeneration}
            isLoading={isLoading}
            isConnected={isConnected}
            onEmojiClick={() => setShowEmojiPicker(!showEmojiPicker)}
            showEmojiPicker={showEmojiPicker}
            onEmojiSelect={handleEmojiSelect}
            inputRef={inputRef}
          />
        </Box>
      </Box>

      {/* Fixed Bottom Nav */}
      <Box 
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '56px',
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          zIndex: 10,
        }}
      />

      {/* Drawers */}
      <ChatSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={themeMode === 'dark'}
        onDarkModeChange={handleDarkModeChange}
        language={language}
        onLanguageChange={handleLanguageChange}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onLogout={handleLogout}
        username={username}
      />

      <Drawer
        anchor="left"
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 320,
            bgcolor: 'background.paper',
          }
        }}
      >
        <ChatHistory
          sessions={sessions}
          currentSessionId={sessionId}
          onSessionSelect={handleSessionSelect}
          onSessionDelete={deleteSession}
          onNewChat={handleNewChat}
        />
      </Drawer>
    </Box>
  );
}; 