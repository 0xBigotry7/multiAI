import React, { useRef } from 'react';
import { Paper, TextField, IconButton, Box, Popover } from '@mui/material';
import { Send as SendIcon, Stop as StopIcon, EmojiEmotions as EmojiIcon } from '@mui/icons-material';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isLoading: boolean;
  isConnected: boolean;
  onEmojiClick?: () => void;
  showEmojiPicker?: boolean;
  onEmojiSelect?: (emoji: string) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onStop,
  isLoading,
  isConnected,
  onEmojiClick,
  showEmojiPicker,
  onEmojiSelect,
  inputRef
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && isConnected && !isLoading) {
      onSend();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    if (onEmojiSelect) {
      onEmojiSelect(emoji.native);
    }
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
      <IconButton
        color="primary"
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
          if (onEmojiClick) onEmojiClick();
        }}
      >
        <EmojiIcon />
      </IconButton>

      <Popover
        open={Boolean(anchorEl) && showEmojiPicker === true}
        anchorEl={anchorEl}
        onClose={() => {
          setAnchorEl(null);
          if (onEmojiClick) onEmojiClick();
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 1 }}>
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="dark"
          />
        </Box>
      </Popover>
      
      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={!isConnected || isLoading}
        placeholder="Type a message..."
        size="small"
        inputRef={inputRef}
        sx={{
          '& .MuiInputBase-root': {
            bgcolor: 'background.paper',
          }
        }}
      />
      
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