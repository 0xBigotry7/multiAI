import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Alert, IconButton, Typography, CircularProgress } from '@mui/material';
import { Settings as SettingsIcon, EmojiEmotions as EmojiIcon } from '@mui/icons-material';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatSettings } from './components/ChatSettings';
import { useChat } from './hooks/useChat';
import { TypewriterEffect } from '../../components/TypewriterEffect';

const WELCOME_MESSAGE = {
  role: 'assistant' as const,
  content: '👋 Hi there! I\'m your AI assistant. I can help you with various tasks, answer questions, or just chat. Feel free to start a conversation!',
  timestamp: new Date()
};

interface SingleAIChatProps {
  selectedAI: string;
  modelConfig: any;
}

export const SingleAIChat: React.FC<SingleAIChatProps> = ({ selectedAI }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    error,
    isConnected,
    sendMessage,
    stopGeneration,
    setError
  } = useChat({
    onTypingStart: () => setIsTyping(true),
    onTypingEnd: () => {
      setIsTyping(false);
      // Auto focus input after response
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  });

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    setShowEmojiPicker(false);
    await sendMessage(inputMessage);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Show welcome message if no messages
  const displayMessages = messages.length === 0 ? [WELCOME_MESSAGE] : messages;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton
          color="primary"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon />
        </IconButton>
      </Box>

      <Paper 
        sx={{ 
          flexGrow: 1, 
          mb: 2, 
          p: 2, 
          overflow: 'auto',
          bgcolor: 'background.paper',
          '&::-webkit-scrollbar': {
            width: '8px',
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
        {displayMessages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isTyping={isTyping && index === messages.length - 1 && message.role === 'assistant'}
          />
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <CircularProgress size={16} />
            <Typography>AI is thinking...</Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Box sx={{ position: 'relative' }}>
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

      <ChatSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        selectedModel={selectedAI}
        onModelChange={() => {}}
      />
    </Box>
  );
}; 