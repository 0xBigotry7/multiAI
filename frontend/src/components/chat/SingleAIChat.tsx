'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Alert, IconButton, Typography, Select, MenuItem, ListSubheader, FormControl } from '@mui/material';
import { Settings as SettingsIcon, Menu as MenuIcon } from '@mui/icons-material';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSettings } from './ChatSettings';
import { ChatHistory } from './ChatHistory';
import { useChat } from '@/lib/hooks/use-chat';
import { useTheme } from '@/lib/hooks/use-theme';
import { Message } from '@/types';

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
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top Bar */}
      <Box 
        sx={{ 
          py: 2, // Consistent padding
          px: 3, // Slightly larger horizontal padding
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        {/* Left Section */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          minWidth: '2.5rem', // Use rem instead of px
        }}>
          <IconButton
            color="primary"
            onClick={() => setHistoryOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Center Section */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <FormControl 
            sx={{ 
              maxWidth: '20rem', // Use rem for max-width
              width: '100%',
            }}
          >
            <Select
              value={selectedAI}
              onChange={(e) => handleModelChange(e.target.value)}
              IconComponent={() => null}
              sx={{
                '.MuiSelect-select': {
                  py: 1.5,
                  fontSize: '1rem',
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
            >
              {Object.entries(AVAILABLE_MODELS).map(([provider, models]) => [
                <ListSubheader key={provider}>{provider}</ListSubheader>,
                ...models.map(model => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))
              ])}
            </Select>
          </FormControl>
        </Box>

        {/* Right Section */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          minWidth: '2.5rem', // Use rem instead of px
        }}>
          <IconButton
            color="primary"
            onClick={() => setSettingsOpen(true)}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Messages Area - Scrollable */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          px: 3,
          py: 2,
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {!isConnected && (
          <Alert 
            severity="warning"
          >
            Connecting to server...
          </Alert>
        )}

        {displayMessages.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg}
            isTyping={isTypingResponse && index === messages.length - 1}
          />
        ))}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Chat Input */}
      <Box 
        sx={{ 
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <ChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={handleSend}
          onStop={stopGeneration}
          isLoading={isLoading}
          showEmojiPicker={showEmojiPicker}
          onEmojiPickerToggle={() => setShowEmojiPicker(!showEmojiPicker)}
          onEmojiSelect={handleEmojiSelect}
          inputRef={inputRef}
        />
      </Box>

      {/* Drawers */}
      <ChatSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={themeMode === 'dark'}
        onDarkModeChange={handleDarkModeChange}
        language={language}
        onLanguageChange={handleLanguageChange}
        isLoggedIn={isLoggedIn}
        username={username}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onLogout={handleLogout}
      />

      <ChatHistory
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        sessions={sessions}
        currentSessionId={sessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        onDeleteSession={deleteSession}
      />
    </Box>
  );
}; 