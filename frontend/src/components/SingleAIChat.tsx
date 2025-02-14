import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Settings as SettingsIcon,
  Mic as MicIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import io, { Socket } from 'socket.io-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SingleAIChatProps {
  selectedAI: string;
  modelConfig: any;
}

const SingleAIChat: React.FC<SingleAIChatProps> = ({ selectedAI, modelConfig }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setError('Disconnected from server. Attempting to reconnect...');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      setError('Failed to connect to server. Please check if the server is running.');
      setIsLoading(false);
    });

    newSocket.on('message', (data: { content: string }) => {
      console.log('Received message:', data);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    });

    newSocket.on('error', (data: { message: string }) => {
      console.error('Server error:', data.message);
      setError(data.message);
      setIsLoading(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !isConnected || isLoading) return;

    const newMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    console.log('Sending message:', inputMessage);
    socket.emit('singleAIMessage', {
      message: inputMessage
      // No need to send model selection since we're using gpt-4o-mini always
    });
  };

  const handleStop = () => {
    if (socket) {
      socket.emit('stopGeneration');
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Paper
              sx={{
                maxWidth: '70%',
                p: 2,
                bgcolor: message.role === 'user' ? 'primary.dark' : 'background.paper',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {message.timestamp.toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <CircularProgress size={16} />
            <Typography>AI is thinking...</Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Paper 
        component="form" 
        onSubmit={handleSend}
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
          onClick={() => setSettingsOpen(true)}
          sx={{ flexShrink: 0 }}
        >
          <SettingsIcon />
        </IconButton>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
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

        {isLoading ? (
          <IconButton
            color="error"
            onClick={handleStop}
            sx={{ flexShrink: 0 }}
          >
            <StopIcon />
          </IconButton>
        ) : (
          <IconButton
            color="primary"
            type="submit"
            disabled={!inputMessage.trim() || !isConnected || isLoading}
            sx={{ flexShrink: 0 }}
          >
            <SendIcon />
          </IconButton>
        )}
      </Paper>

      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>
          <Divider sx={{ my: 2 }} />
          <List>
            <ListItem>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Selected Model"
                secondary={selectedAI || 'Default'}
              />
            </ListItem>
            {/* Add more settings as needed */}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default SingleAIChat; 