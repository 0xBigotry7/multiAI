import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { Message } from '../../../types/chat';
import { TypewriterEffect } from '../../../components/TypewriterEffect';

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isTyping = false
}) => {
  const isUser = message.role === 'user';
  const [displayedContent, setDisplayedContent] = useState(message.content);
  const [isComplete, setIsComplete] = useState(!isTyping);
  const previousContentRef = useRef(message.content);

  // Update displayed content when message content changes (for streaming)
  useEffect(() => {
    // Only update if content has actually changed
    if (message.content !== previousContentRef.current) {
      setDisplayedContent(message.content);
      previousContentRef.current = message.content;
      
      if (isTyping) {
        setIsComplete(false);
      }
    }
  }, [message.content, isTyping]);

  const handleTypingComplete = () => {
    setIsComplete(true);
  };

  const formatTimestamp = (timestamp: Date | string) => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString();
    }
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',
          p: 2,
          bgcolor: message.role === 'user' ? 'primary.dark' : 'background.paper',
          borderRadius: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
          border: '1px solid',
          borderColor: message.role === 'user' ? 'primary.main' : 'divider',
          boxShadow: 1,
        }}
      >
        <Avatar 
          sx={{ 
            bgcolor: isUser ? 'primary.main' : 'secondary.main',
            width: 32,
            height: 32,
          }}
        >
          {isUser ? 'U' : 'A'}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              minHeight: '1.5em',
            }}
          >
            {isTyping && !isUser && !isComplete ? (
              <TypewriterEffect 
                text={displayedContent}
                speed={30}
                onComplete={handleTypingComplete}
              />
            ) : (
              displayedContent
            )}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              mt: 1, 
              display: 'block',
              textAlign: 'right'
            }}
          >
            {formatTimestamp(message.timestamp)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}; 