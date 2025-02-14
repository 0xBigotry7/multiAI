import React, { useRef, useCallback, useState } from 'react';
import { Box, Paper, Alert, IconButton } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatSettings } from './components/ChatSettings';
import { useChat } from './hooks/useChat';

interface SingleAIChatProps {
  selectedAI: string;
  modelConfig: any;
}

const SingleAIChat: React.FC<SingleAIChatProps> = ({ selectedAI, modelConfig }) => {
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
  } = useChat();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSend = () => {
    sendMessage(inputMessage);
    scrollToBottom();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
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
          <ChatMessage key={index} message={message} />
        ))}
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
      />
    </Box>
  );
};

export default SingleAIChat; 