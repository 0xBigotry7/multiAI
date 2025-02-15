'use client';

import React, { useState } from 'react';
import { Box, IconButton, TextField, CircularProgress, useTheme, Typography } from '@mui/material';
import { Send as SendIcon, Stop as StopIcon, EmojiEmotions as EmojiIcon } from '@mui/icons-material';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { ChatInputProps } from '@/types';

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onStop,
  isLoading,
  showEmojiPicker,
  onEmojiPickerToggle,
  onEmojiSelect,
  inputRef,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [isFocused, setIsFocused] = useState(false);
  const MAX_CHARS = 4000;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (value.length + pastedText.length > MAX_CHARS) {
      e.preventDefault();
    }
  };

  const characterCount = value.length;
  const isNearLimit = characterCount > MAX_CHARS * 0.9;

  return (
    <Box sx={{ 
      position: 'relative',
      backdropFilter: 'blur(8px)',
      backgroundColor: isDark 
        ? 'rgba(9, 9, 11, 0.8)' 
        : 'rgba(255, 255, 255, 0.8)',
    }}>
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        alignItems: 'flex-end',
        p: 2,
        borderTop: '1px solid',
        borderColor: isDark 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.1)',
      }}>
        <IconButton
          color="primary"
          onClick={onEmojiPickerToggle}
          sx={{
            mb: 1,
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <EmojiIcon />
        </IconButton>

        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue.length <= MAX_CHARS) {
              onChange(newValue);
            }
          }}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isLoading ? "Waiting for response..." : "Type a message... (Press Enter to send, Shift+Enter for new line)"}
          inputRef={inputRef}
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)',
              transition: theme.transitions.create(
                ['background-color', 'box-shadow', 'border-color'],
                { duration: 200 }
              ),
              '& fieldset': {
                borderColor: isFocused
                  ? theme.palette.primary.main
                  : (isDark 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)'),
              },
              '&:hover fieldset': {
                borderColor: isDark 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.2)',
              },
              '&.Mui-focused': {
                backgroundColor: isDark 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.1)',
                '& fieldset': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: '2px',
                },
              },
            },
            '& .MuiInputBase-input': {
              color: isDark 
                ? 'rgba(255, 255, 255, 0.9)' 
                : 'rgba(0, 0, 0, 0.9)',
            },
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            color="primary"
            onClick={isLoading ? onStop : onSend}
            disabled={!value.trim() && !isLoading}
            sx={{
              mb: 1,
              transition: 'all 0.2s ease',
              ...(isDark && {
                backgroundColor: value.trim() || isLoading 
                  ? 'rgba(37, 99, 235, 0.1)' 
                  : 'transparent',
                '&:hover': {
                  backgroundColor: value.trim() || isLoading 
                    ? 'rgba(37, 99, 235, 0.2)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  transform: 'scale(1.1)',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'transparent',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }),
            }}
          >
            {isLoading ? <StopIcon /> : <SendIcon />}
          </IconButton>
          
          {/* Character count */}
          {value.length > 0 && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                color: isNearLimit ? 'error.main' : 'text.secondary',
                opacity: 0.8,
                minWidth: '3rem',
                textAlign: 'center'
              }}
            >
              {characterCount}/{MAX_CHARS}
            </Typography>
          )}
        </Box>
      </Box>

      {showEmojiPicker && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            mb: 1,
            zIndex: 1000,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: isDark 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)' 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => onEmojiSelect(emoji.native)}
            theme={isDark ? 'dark' : 'light'}
          />
        </Box>
      )}
    </Box>
  );
}; 