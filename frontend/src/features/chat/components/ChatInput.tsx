import React from 'react';
import { Paper, TextField, IconButton } from '@mui/material';
import { Send as SendIcon, Mic as MicIcon, Stop as StopIcon } from '@mui/icons-material';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isLoading: boolean;
  isConnected: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onStop,
  isLoading,
  isConnected
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend();
  };

  return (
    <Paper 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ 
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'background.paper',
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type a message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!isConnected || isLoading}
        size="small"
      />
      
      <IconButton
        color="primary"
        disabled={!isConnected}
        sx={{ flexShrink: 0 }}
      >
        <MicIcon />
      </IconButton>

      {isLoading && onStop ? (
        <IconButton
          color="error"
          onClick={onStop}
          sx={{ flexShrink: 0 }}
        >
          <StopIcon />
        </IconButton>
      ) : (
        <IconButton
          color="primary"
          type="submit"
          disabled={!value.trim() || !isConnected || isLoading}
          sx={{ flexShrink: 0 }}
        >
          <SendIcon />
        </IconButton>
      )}
    </Paper>
  );
}; 