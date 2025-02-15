'use client';

import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Button,
  TextField,
  Divider,
  Collapse,
  ListItemIcon,
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Search as SearchIcon,
  ExpandLess,
  ExpandMore,
  Chat as ChatIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { ChatHistoryProps, ChatSession } from '@/types';

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  open,
  onClose,
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string>('today');

  // Group sessions by date
  const groupedSessions = sessions.reduce((acc, session: ChatSession) => {
    const date = new Date(session.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let group = 'older';
    if (date.toDateString() === today.toDateString()) {
      group = 'today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = 'yesterday';
    } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      group = 'thisWeek';
    }

    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(session);
    return acc;
  }, {} as Record<string, ChatSession[]>);

  const filteredSessions = (groupSessions: ChatSession[]) => {
    const query = searchQuery.toLowerCase();
    return groupSessions.filter(session => {
      const titleMatch = (session.title || '').toLowerCase().includes(query);
      const messageMatch = (session.lastMessage || '').toLowerCase().includes(query);
      return titleMatch || messageMatch;
    });
  };

  const renderSessionGroup = (title: string, icon: React.ReactNode, groupSessions: ChatSession[], groupKey: string) => {
    const isExpanded = expandedSection === groupKey;
    const filteredGroupSessions = filteredSessions(groupSessions);

    if (filteredGroupSessions.length === 0) return null;

    return (
      <>
        <ListItemButton
          onClick={() => setExpandedSection(isExpanded ? '' : groupKey)}
          sx={{ py: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {icon}
          </ListItemIcon>
          <ListItemText 
            primary={title}
            secondary={`${filteredGroupSessions.length} chats`}
          />
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {filteredGroupSessions.map((session) => (
              <ListItem
                key={session.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    size="small"
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '.MuiListItem-root:hover &': {
                        opacity: 1,
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ pl: 4 }}
              >
                <ListItemButton
                  selected={session.id === currentSessionId}
                  onClick={() => onSessionSelect(session.id)}
                  sx={{
                    borderRadius: 1,
                    my: 0.5,
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <ChatIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={session.title || 'Untitled Chat'}
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{
                          '.Mui-selected &': {
                            color: 'primary.contrastText',
                            opacity: 0.8,
                          },
                        }}
                      >
                        {session.lastMessage}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </>
    );
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          p: 2,
        },
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onNewChat}
          startIcon={<ChatIcon />}
          sx={{
            py: 1,
            mb: 2,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          New Chat
        </Button>

        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      <List sx={{ width: '100%' }} component="nav">
        {renderSessionGroup('Today', <TodayIcon />, groupedSessions.today || [], 'today')}
        {renderSessionGroup('Yesterday', <DateRangeIcon />, groupedSessions.yesterday || [], 'yesterday')}
        {renderSessionGroup('This Week', <DateRangeIcon />, groupedSessions.thisWeek || [], 'thisWeek')}
        {renderSessionGroup('Older', <ArchiveIcon />, groupedSessions.older || [], 'older')}
      </List>
    </Drawer>
  );
}; 