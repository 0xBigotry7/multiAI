import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { ChatSession } from '../../../services/chat/chatPersistence';

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onSessionDelete: (sessionId: string) => void;
  onNewChat: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onSessionDelete,
  onNewChat,
}) => {
  const getSessionPreview = (session: ChatSession) => {
    // Get first message content or default title
    if (session.messages && session.messages.length > 0) {
      const firstMessage = session.messages[0].content;
      return firstMessage.length > 30 ? firstMessage.slice(0, 30) + '...' : firstMessage;
    }
    return 'New Chat';
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <ListItemButton
          onClick={onNewChat}
          sx={{
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'primary.main',
            mb: 1,
          }}
        >
          <ListItemIcon>
            <AddIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="New Chat" />
        </ListItemButton>
      </Box>

      <Divider />

      <List sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
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
      }}>
        {sessions.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">No chat history</Typography>
          </Box>
        ) : (
          sessions.map((session) => (
            <ListItem
              key={session.id}
              disablePadding
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSessionDelete(session.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemButton
                selected={session.id === currentSessionId}
                onClick={() => onSessionSelect(session.id)}
                sx={{ 
                  py: 2,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                  }
                }}
              >
                <ListItemIcon>
                  <ChatIcon color={session.id === currentSessionId ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText
                  primary={session.title || getSessionPreview(session)}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(session.lastUpdated).toLocaleString()}
                      </Typography>
                      {session.metadata?.summary && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {session.metadata.summary}
                        </Typography>
                      )}
                      {!session.metadata?.summary && session.messages && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {session.messages.length} messages
                        </Typography>
                      )}
                    </Box>
                  }
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { fontWeight: session.id === currentSessionId ? 'bold' : 'normal' }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
}; 