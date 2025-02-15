'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, TextField, Button, Paper, Typography, CircularProgress, Alert, LinearProgress, Select, MenuItem, FormControl, InputLabel, ListSubheader } from '@mui/material';
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

export const ChatSimulator: React.FC<ChatSimulatorProps> = ({ mode, selectedAI, modelConfig, onModelChange }) => {
  const [socket, setSocket] = useState(socketService.getSocket());
  const [prompt, setPrompt] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState(DEFAULT_CONFIG.name);
  const [selectedModelA, setSelectedModelA] = useState("gpt-4o-mini");
  const [selectedModelB, setSelectedModelB] = useState("gpt-4o-mini");
  const [messages, setMessages] = useState<SimulatorMessage[]>([]);
  const [messageQueue, setMessageQueue] = useState<SimulatorMessage[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isStopRequested, setIsStopRequested] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [isStopped, setIsStopped] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (message: SimulatorMessage) => {
      setMessageQueue(prev => [...prev, message]);
    });

    socket.on(SOCKET_EVENTS.CHAT_COMPLETE, () => {
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
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const processNextMessage = async () => {
      if (messageQueue.length === 0 || isProcessingQueue) return;
      
      setIsProcessingQueue(true);
      const message = messageQueue[0];
      
      setMessages(prev => [...prev, message]);
      setMessageQueue(prev => prev.slice(1));
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Add delay between messages
      setIsProcessingQueue(false);
    };

    processNextMessage();
  }, [messageQueue, isProcessingQueue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setMessages([]);
    setError(null);
    setCanContinue(false);
    setIsStopped(false);
    setCurrentRound(0);
    setTotalRounds(0);

    const config: ConversationConfig = {
      mode,
      prompt: prompt.trim(),
      personality: AGENT_CONFIGS.find(c => c.name === selectedPersonality) || DEFAULT_CONFIG,
      modelA: selectedModelA,
      modelB: selectedModelB,
    };

    socket.emit(SOCKET_EVENTS.START_CHAT, config);
  };

  const handleStopConversation = () => {
    setIsStopRequested(true);
    socket.emit(SOCKET_EVENTS.STOP_CHAT);
    setIsStopped(true);
  };

  const handleContinueConversation = () => {
    setCanContinue(false);
    socket.emit(SOCKET_EVENTS.CONTINUE_CHAT);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={0} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Personality</InputLabel>
              <Select
                value={selectedPersonality}
                label="Personality"
                onChange={(e) => setSelectedPersonality(e.target.value)}
                disabled={isLoading}
              >
                {AGENT_CONFIGS.map(config => (
                  <MenuItem key={config.name} value={config.name}>
                    {config.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {mode === 'multi' && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Model A</InputLabel>
                  <Select
                    value={selectedModelA}
                    label="Model A"
                    onChange={(e) => setSelectedModelA(e.target.value)}
                    disabled={isLoading}
                  >
                    {Object.entries(AI_MODELS).map(([provider, models]) => [
                      <ListSubheader key={provider}>{provider}</ListSubheader>,
                      ...models.map(model => (
                        <MenuItem key={model} value={model}>
                          {model}
                        </MenuItem>
                      ))
                    ])}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Model B</InputLabel>
                  <Select
                    value={selectedModelB}
                    label="Model B"
                    onChange={(e) => setSelectedModelB(e.target.value)}
                    disabled={isLoading}
                  >
                    {Object.entries(AI_MODELS).map(([provider, models]) => [
                      <ListSubheader key={provider}>{provider}</ListSubheader>,
                      ...models.map(model => (
                        <MenuItem key={model} value={model}>
                          {model}
                        </MenuItem>
                      ))
                    ])}
                  </Select>
                </FormControl>
              </>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a conversation prompt..."
              disabled={isLoading}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                type="submit"
                disabled={!prompt.trim() || isLoading || !isConnected}
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
        <div ref={messagesEndRef} />
      </Box>
    </Box>
  );
}; 