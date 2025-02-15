'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { ChatMessageProps } from '@/types';

const LoadingDots: React.FC = () => {
  const [dots, setDots] = useState('');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 300); // Faster animation

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ 
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      fontStyle: 'italic'
    }}>
      <span>Thinking</span>
      <span style={{ 
        minWidth: '24px',
        display: 'inline-block'
      }}>
        {dots}
      </span>
    </Box>
  );
};

const TypingAnimation: React.FC<{ 
  text: string; 
  onComplete?: () => void;
  speed?: number;
}> = ({ text, onComplete, speed = 20 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Start fresh with new text
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, speed);
    } else {
      onComplete?.();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, text, speed, onComplete]);

  return <>{displayedText}</>;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isTyping }) => {
  const theme = useTheme();
  const isAssistant = message.role === 'assistant';
  const isDark = theme.palette.mode === 'dark';
  const [showCursor, setShowCursor] = useState(isTyping || (!message.isComplete && !message.isStreamed));
  const [isAnimating, setIsAnimating] = useState(!message.isComplete && !message.isStreamed);

  useEffect(() => {
    setShowCursor(isTyping || (!message.isComplete && !message.isStreamed));
    setIsAnimating(!message.isComplete && !message.isStreamed);
  }, [isTyping, message.isComplete, message.isStreamed]);

  const formatTimestamp = (date: Date) => {
    // Ensure we have a valid Date object
    const messageDate = date instanceof Date ? date : new Date(date);
    
    if (isNaN(messageDate.getTime())) {
      return ''; // Return empty string for invalid dates
    }

    return new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(messageDate);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isAssistant ? 'flex-start' : 'flex-end',
        mb: 2,
        opacity: 0,
        animation: 'fadeIn 0.3s ease forwards',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          maxWidth: '80%',
          p: 2,
          borderRadius: 2,
          backgroundColor: isAssistant 
            ? (isDark ? 'rgba(37, 99, 235, 0.1)' : 'primary.dark')
            : (isDark ? 'rgba(75, 85, 99, 0.1)' : 'secondary.dark'),
          color: isDark ? 'text.primary' : (isAssistant ? 'primary.contrastText' : 'secondary.contrastText'),
          border: isDark ? '1px solid' : 'none',
          borderColor: isAssistant 
            ? 'rgba(37, 99, 235, 0.2)' 
            : 'rgba(75, 85, 99, 0.2)',
          boxShadow: isDark 
            ? '0 2px 4px rgba(0,0,0,0.1)' 
            : '0 2px 4px rgba(0,0,0,0.05)',
          transition: theme.transitions.create(
            ['background-color', 'border-color', 'box-shadow', 'transform'],
            { duration: 200 }
          ),
          '&:hover': {
            boxShadow: isDark 
              ? '0 4px 6px rgba(0,0,0,0.2)' 
              : '0 4px 6px rgba(0,0,0,0.1)',
            transform: 'translateY(-1px)'
          }
        }}
      >
        <Typography 
          sx={{ 
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            letterSpacing: '0.01em',
            ...(isDark && {
              color: isAssistant 
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(255, 255, 255, 0.9)'
            }),
            position: 'relative',
            '&::after': showCursor ? {
              content: '"|"',
              position: 'relative',
              marginLeft: '2px',
              animation: 'blink 1s step-start infinite',
            } : {},
            '@keyframes blink': {
              '50%': {
                opacity: 0,
              },
            },
          }}
        >
          {isAssistant && message.content === '' && isTyping ? (
            <LoadingDots />
          ) : isAssistant && isAnimating ? (
            <TypingAnimation 
              text={message.content} 
              speed={20}
              onComplete={() => {
                setIsAnimating(false);
                setShowCursor(false);
              }}
            />
          ) : (
            message.content
          )}
        </Typography>
        
        {/* Timestamp */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: -20,
            [isAssistant ? 'left' : 'right']: 2,
            color: 'text.secondary',
            fontSize: '0.75rem',
            opacity: 0.7
          }}
        >
          {formatTimestamp(message.timestamp)}
        </Typography>
      </Box>
    </Box>
  );
}; 