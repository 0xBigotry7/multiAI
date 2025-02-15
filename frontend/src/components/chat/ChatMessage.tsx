'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, useTheme, Avatar } from '@mui/material';
import { ChatMessageProps } from '@/types';
import Image from 'next/image';

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

const MODEL_LOGOS = {
  'OpenAI': '/logos/openai-logo.png',
  'DeepSeek': '/logos/deepseek-logo.png'
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [showCursor, setShowCursor] = useState(!message.isComplete && !message.isStreamed);
  const [isAnimating, setIsAnimating] = useState(!message.isComplete && !message.isStreamed);

  useEffect(() => {
    setShowCursor(!message.isComplete && !message.isStreamed);
    setIsAnimating(!message.isComplete && !message.isStreamed);
  }, [message.isComplete, message.isStreamed]);

  const getProviderFromModel = (role: string) => {
    if (role === 'user') return null;
    // Default to OpenAI if no specific provider is found
    return 'OpenAI';
  };

  const provider = getProviderFromModel(message.role);
  const logoSrc = provider ? MODEL_LOGOS[provider] : null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
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
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          flexDirection: isUser ? 'row-reverse' : 'row',
          maxWidth: '80%',
        }}
      >
        {/* Avatar */}
        {isUser ? (
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 32,
              height: 32,
            }}
          >
            U
          </Avatar>
        ) : (
          <Avatar
            sx={{
              bgcolor: 'white',
              width: 32,
              height: 32,
              border: 1,
              borderColor: 'divider',
            }}
          >
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt="AI Provider Logo"
                width={24}
                height={24}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              'A'
            )}
          </Avatar>
        )}

        {/* Message Bubble */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: isUser 
              ? (isDark ? 'primary.dark' : 'primary.main')
              : (isDark ? 'background.paper' : 'grey.100'),
            color: isUser 
              ? 'primary.contrastText'
              : 'text.primary',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 10,
              [isUser ? 'right' : 'left']: -6,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: isUser 
                ? '6px 0 6px 6px'
                : '6px 6px 6px 0',
              borderColor: isUser
                ? 'transparent transparent transparent ' + (isDark ? theme.palette.primary.dark : theme.palette.primary.main)
                : 'transparent ' + (isDark ? theme.palette.background.paper : theme.palette.grey[100]) + ' transparent transparent',
            }
          }}
        >
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              position: 'relative',
              '&::after': showCursor ? {
                content: '"|"',
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
            {message.content}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}; 