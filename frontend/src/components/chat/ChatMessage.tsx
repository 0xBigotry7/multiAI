'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, useTheme } from '@mui/material';
import { ChatMessageProps } from '@/types';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

const LoadingDots: React.FC = () => {
  const [dots, setDots] = useState('');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 300);

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
      <span style={{ minWidth: '24px', display: 'inline-block' }}>{dots}</span>
    </Box>
  );
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
                ? `transparent transparent transparent ${isDark ? theme.palette.primary.dark : theme.palette.primary.main}`
                : `transparent ${isDark ? theme.palette.background.paper : theme.palette.grey[100]} transparent transparent`,
            }
          }}
        >
          {isUser ? (
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {message.content}
            </Typography>
          ) : (
            <Box
              sx={{
                '& .markdown-content': {
                  '& > :first-child': { mt: 0 },
                  '& > :last-child': { mb: 0 },
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    mt: 2,
                    mb: 1,
                    fontWeight: 600,
                    lineHeight: 1.25,
                  },
                  '& p': {
                    my: 1,
                    lineHeight: 1.6,
                  },
                  '& a': {
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  },
                  '& code': {
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    fontFamily: 'monospace',
                  },
                  '& pre': {
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    overflow: 'auto',
                    '& code': {
                      p: 0,
                      bgcolor: 'transparent',
                    },
                  },
                  '& ul, & ol': {
                    pl: 3,
                    my: 1,
                  },
                  '& li': {
                    mb: 0.5,
                  },
                  '& blockquote': {
                    my: 1,
                    pl: 2,
                    borderLeft: 4,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    fontStyle: 'italic',
                  },
                  '& table': {
                    borderCollapse: 'collapse',
                    width: '100%',
                    my: 2,
                  },
                  '& th, & td': {
                    border: 1,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    p: 1,
                  },
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 1,
                  },
                },
                position: 'relative',
                '&::after': showCursor ? {
                  content: '"|"',
                  position: 'absolute',
                  right: -2,
                  animation: 'blink 1s step-start infinite',
                } : {},
                '@keyframes blink': {
                  '50%': {
                    opacity: 0,
                  },
                },
              }}
              className="markdown-content"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                components={{
                  // Override components for better styling
                  p: ({ children }) => (
                    <Typography variant="body1" component="p">
                      {children}
                    </Typography>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}; 