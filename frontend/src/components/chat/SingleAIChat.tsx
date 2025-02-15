'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Alert, IconButton, Typography, Select, MenuItem, ListSubheader, FormControl, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Settings as SettingsIcon, Menu as MenuIcon, Chat as ChatIcon, Groups as GroupsIcon, Psychology as PsychologyIcon } from '@mui/icons-material';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSettings } from './ChatSettings';
import { ChatHistory } from './ChatHistory';
import { useChat } from '@/lib/hooks/use-chat';
import { useTheme } from '@/lib/hooks/use-theme';
import { Message } from '@/types';
import { useAuthCore } from '@particle-network/auth-core-modal';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { languages, type Locale } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

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

const MODEL_LOGOS = {
  'OpenAI': '/logos/openai-logo.png',
  'DeepSeek': '/logos/deepseek-logo.png'
};

interface SingleAIChatProps {
  selectedAI: string;
  modelConfig: any;
  onModelChange: (model: string) => void;
}

type Provider = keyof typeof MODEL_LOGOS;

const ModelMenuItem = ({ provider, model }: { provider: Provider; model: string }) => (
  <MenuItem 
    key={model} 
    value={model}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      py: 1.5,
    }}
  >
    <Box
      sx={{
        width: 24,
        height: 24,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        src={MODEL_LOGOS[provider]}
        alt={`${provider} logo`}
        width={24}
        height={24}
        style={{ objectFit: 'contain' }}
      />
    </Box>
    <Typography>{model}</Typography>
  </MenuItem>
);

export const SingleAIChat: React.FC<SingleAIChatProps> = ({ 
  selectedAI, 
  modelConfig,
  onModelChange 
}) => {
  const t = useTranslations();
  const { mode: themeMode, setThemeMode } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [locale, setLocale] = useState<Locale>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const authCore = useAuthCore();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);

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

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Scroll on new messages or when typing
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTypingResponse, scrollToBottom]);

  // Get provider and model name for display
  const getModelDisplay = (modelId: string) => {
    for (const [provider, models] of Object.entries(AVAILABLE_MODELS)) {
      if (models.includes(modelId)) {
        return `${provider} / ${modelId}`;
      }
    }
    return modelId;
  };

  const handleModelChange = (event: any) => {
    const newModel = event.target.value;
    if (newModel === selectedModel) return;
    
    // Update both the local state and parent component
    setSelectedModel(newModel);
    onModelChange(newModel);
    
    // If there's no active session, create one with the new model
    if (!sessionId) {
      createNewSession(newModel);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    if (!sessionId) {
      createNewSession(selectedModel);
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

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('preferred_language', newLocale);
  };

  // Load preferred language on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('preferred_language');
    if (savedLocale && Object.keys(languages).includes(savedLocale)) {
      setLocale(savedLocale as Locale);
    }
  }, []);

  const handleLogin = () => {
    // Login is handled by Particle
  };

  const handleSignup = () => {
    // Signup is handled by Particle
  };

  const handleLogout = () => {
    // Logout is handled by Particle
  };

  // Display welcome message only when there are no messages and no active session
  const displayMessages = messages.length > 0 || sessionId ? messages : [{
    role: 'assistant' as const,
    content: t('common.welcome', { model: getModelDisplay(selectedAI) }),
    timestamp: new Date()
  }];

  const handleTabChange = (event: any, newValue: number) => {
    setCurrentTab(newValue);
    switch (newValue) {
      case 0: // Single AI Chat
        router.push('/chat');
        break;
      case 1: // Multi AI Chat
        router.push('/simulator');
        break;
      case 2: // Interactive Scene
        // Coming soon, stay on current page
        break;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar */}
      <Paper 
        elevation={0}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          width: '100%',
          zIndex: 10,
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="primary"
            onClick={() => setHistoryOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <FormControl 
            sx={{ 
              maxWidth: '20rem',
              width: '100%',
            }}
          >
            <Select
              value={selectedModel || selectedAI}
              onChange={handleModelChange}
              displayEmpty
              sx={{
                '.MuiSelect-select': {
                  py: 1.5,
                  fontSize: '1rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
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
              renderValue={(selected) => {
                const provider = Object.entries(AVAILABLE_MODELS).find(([_, models]) => 
                  models.includes(selected)
                )?.[0] as keyof typeof MODEL_LOGOS;
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {provider && (
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Image
                          src={MODEL_LOGOS[provider]}
                          alt={`${provider} logo`}
                          width={20}
                          height={20}
                          style={{ objectFit: 'contain' }}
                        />
                      </Box>
                    )}
                    {selected}
                  </Box>
                );
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
                <ListSubheader 
                  key={provider}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Image
                      src={MODEL_LOGOS[provider as keyof typeof MODEL_LOGOS]}
                      alt={`${provider} logo`}
                      width={24}
                      height={24}
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                  {provider}
                </ListSubheader>,
                models.map(model => (
                  <MenuItem 
                    key={model} 
                    value={model}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      pl: 4,
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Image
                        src={MODEL_LOGOS[provider as keyof typeof MODEL_LOGOS]}
                        alt={`${provider} logo`}
                        width={24}
                        height={24}
                        style={{ objectFit: 'contain' }}
                      />
                    </Box>
                    <Typography>{model}</Typography>
                  </MenuItem>
                ))
              ])}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="primary"
            onClick={() => setSettingsOpen(true)}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Messages Area - Scrollable */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          px: 3,
          py: 2,
          mt: '72px', // Height of top bar
          mb: '180px', // Increased to accommodate both input and bottom nav
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
          >
            {t(`errors.${error}`)}
          </Alert>
        )}

        {!isConnected && (
          <Alert 
            severity="warning"
          >
            {t('common.connecting')}
          </Alert>
        )}

        {displayMessages.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg}
            isUser={msg.role === 'user'}
          />
        ))}
        
        {/* Scroll anchor */}
        <Box ref={messagesEndRef} sx={{ float: 'left', clear: 'both' }} />
      </Box>

      {/* Chat Input */}
      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: '56px', // Height of bottom navigation
          left: 0,
          right: 0,
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          width: '100%',
          zIndex: 10,
          bgcolor: 'background.default',
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
      </Paper>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={currentTab}
        onChange={handleTabChange}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: 1,
          borderColor: 'divider',
          width: '100%',
          height: '56px',
          zIndex: 10,
          bgcolor: 'background.default',
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

      {/* Drawers */}
      <ChatSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={themeMode === 'dark'}
        onDarkModeChange={handleDarkModeChange}
        language={locale}
        onLanguageChange={handleLanguageChange}
        isLoggedIn={!!authCore.userInfo}
        username={(authCore.userInfo?.email || authCore.userInfo?.name || t('chat.you'))}
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