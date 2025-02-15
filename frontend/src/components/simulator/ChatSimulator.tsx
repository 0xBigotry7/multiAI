'use client';

import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, Alert, LinearProgress, Select, MenuItem, FormControl, InputLabel, ListSubheader } from '@mui/material';
import { socketService } from '@/lib/socket/socket';
import { SOCKET_EVENTS } from '@/lib/socket/events';
import { AGENT_CONFIGS, DEFAULT_CONFIG, AI_MODELS } from '@/lib/config/agentPersonalities';
import { SimulatorMessage, ConversationConfig } from '@/types';

interface ChatSimulatorProps {
  mode: 'single' | 'multi';
  selectedAI: string;
  modelConfig: any;
  onModelChange: (model: string) => void;
}

interface StreamMessage {
  content: string;
  isComplete: boolean;
}

interface ExtendedSimulatorMessage extends SimulatorMessage {
  isComplete?: boolean;
}

export const ChatSimulator: React.FC<ChatSimulatorProps> = ({ mode, selectedAI, modelConfig, onModelChange }) => {
  const [socket, setSocket] = useState(socketService.getSocket());
  const [messages, setMessages] = useState<ExtendedSimulatorMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setError('Lost connection to server');
    });

    socket.on(SOCKET_EVENTS.ERROR, (error: string) => {
      console.error('Socket error:', error);
      setError(error);
      setIsLoading(false);
    });

    socket.on(SOCKET_EVENTS.MESSAGE_STREAM, (data: StreamMessage) => {
      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        
        if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.isComplete) {
          // Update existing message
          return updated.map(msg => 
            msg === lastMessage 
              ? { ...msg, content: msg.content + data.content, isComplete: data.isComplete }
              : msg
          );
        } else {
          // Add new message
          return [...updated, {
            role: 'assistant',
            content: data.content,
            name: 'AI',
            timestamp: new Date(),
            isComplete: data.isComplete
          }];
        }
      });

      if (data.isComplete) {
        setIsLoading(false);
      }
    });

    socket.on(SOCKET_EVENTS.CONVERSATION_COMPLETE, () => {
      setIsLoading(false);
      setCanContinue(true);
      setIsStopped(false);
    });

    socket.on(SOCKET_EVENTS.ROUND_UPDATE, ({ current, total }: { current: number, total: number }) => {
      setCurrentRound(current);
      setTotalRounds(total);
    });

    setSocket(socket);

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT);
      socket.off(SOCKET_EVENTS.DISCONNECT);
      socket.off(SOCKET_EVENTS.ERROR);
      socket.off(SOCKET_EVENTS.MESSAGE_STREAM);
      socket.off(SOCKET_EVENTS.CONVERSATION_COMPLETE);
      socket.off(SOCKET_EVENTS.ROUND_UPDATE);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setMessages([]);
    setError(null);
    setCanContinue(false);
    setIsStopped(false);
    setCurrentRound(0);
    setTotalRounds(0);

    const config: ConversationConfig = {
      mode,
      prompt: '',
      personality: AGENT_CONFIGS.find(c => c.name === DEFAULT_CONFIG.name) || DEFAULT_CONFIG,
      modelA: selectedAI,
      modelB: selectedAI
    };

    socket.emit(SOCKET_EVENTS.START_CONVERSATION, config);
  };

  const handleStopConversation = () => {
    socket.emit(SOCKET_EVENTS.STOP_CONVERSATION);
    setIsStopped(true);
  };

  const handleContinueConversation = () => {
    setCanContinue(false);
    socket.emit(SOCKET_EVENTS.START_CONVERSATION, {
      mode,
      selectedAI,
      modelConfig,
      is_continuation: true
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={0} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={selectedAI}
                label="Model"
                onChange={(e) => onModelChange(e.target.value)}
                disabled={isLoading}
              >
                {Object.entries(AI_MODELS).map(([provider, models]) => [
                  <ListSubheader key={provider}>{provider}</ListSubheader>,
                  models.map(model => (
                    <MenuItem key={model} value={model}>
                      {model}
                    </MenuItem>
                  ))
                ])}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading || !isConnected}
            >
              Start
            </Button>
            {isLoading && !isStopped && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleStopConversation}
              >
                Stop
              </Button>
            )}
            {canContinue && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleContinueConversation}
              >
                Continue
              </Button>
            )}
          </Box>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {!isConnected && (
        <Alert severity="warning" sx={{ m: 2 }}>
          Connecting to server...
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
          <LinearProgress 
            variant="determinate" 
            value={(currentRound / totalRounds) * 100} 
            sx={{ height: 2 }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              color: 'text.secondary',
              py: 0.5
            }}
          >
            Round {currentRound} of {totalRounds}
          </Typography>
        </Box>
      )}

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: message.role === 'system' ? 'action.hover' : 'background.paper',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: message.role === 'system' ? 'text.secondary' : 'primary.main',
                mb: 0.5
              }}
            >
              {message.role === 'system' ? 'System' : message.name}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}; 