import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Alert, IconButton, Typography, CircularProgress } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSettings } from './ChatSettings';
import { useChat } from '../hooks/useChat';

interface SingleAIChatProps {
  selectedAI: string;
  modelConfig: any;
}

export const SingleAIChat: React.FC<SingleAIChatProps> = ({ selectedAI }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    onTypingEnd: () => setIsTyping(false)
  });

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    await sendMessage(inputMessage);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
        {messages.map((message, index) => (
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

      <ChatInput
        value={inputMessage}
        onChange={setInputMessage}
        onSend={handleSend}
        onStop={stopGeneration}
        isLoading={isLoading}
        isConnected={isConnected}
      />

      <ChatSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        selectedModel={selectedAI}
        onModelChange={() => {}}
      />
    </Box>
  );
}; 