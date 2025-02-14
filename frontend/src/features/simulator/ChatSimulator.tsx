import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, TextField, Button, Paper, Typography, CircularProgress, Alert, LinearProgress, Select, MenuItem, FormControl, InputLabel, ListSubheader } from '@mui/material';
import { socketService } from '../../services/socket/socket';
import { SOCKET_EVENTS } from '../../services/socket/events';
import { AGENT_CONFIGS, DEFAULT_CONFIG, AI_MODELS } from '../../config/agentPersonalities';
import { SimulatorMessage, ConversationConfig } from '../../types/simulator';

interface ChatSimulatorProps {
  mode: 'single' | 'multi';
  selectedAI: string;
  modelConfig: any;
  onModelChange: (model: string) => void;
}

const ChatSimulator: React.FC<ChatSimulatorProps> = ({ mode, selectedAI, modelConfig, onModelChange }) => {
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
      setError('Disconnected from server. Attempting to reconnect...');
    });

    socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      setError('Failed to connect to server. Please check if the server is running.');
      setIsLoading(false);
    });

    socket.on(SOCKET_EVENTS.ROUND_UPDATE, (data: { round: number; total: number; can_continue: boolean }) => {
      setCurrentRound(data.round);
      setTotalRounds(data.total);
      setCanContinue(data.can_continue);
    });

    socket.on(SOCKET_EVENTS.CONVERSATION_UPDATE, (data: SimulatorMessage) => {
      setMessageQueue(prev => [...prev, data]);
    });

    socket.on(SOCKET_EVENTS.CONVERSATION_COMPLETE, () => {
      setIsLoading(false);
      setCanContinue(false);
      setIsStopped(false);
    });

    socket.on(SOCKET_EVENTS.ERROR, (error: { message: string }) => {
      setError(error.message);
      setIsLoading(false);
    });

    socket.on(SOCKET_EVENTS.CONVERSATION_STOPPED, (data: { current_round: number; can_continue: boolean }) => {
      setIsLoading(false);
      setIsStopRequested(false);
      setCanContinue(data.can_continue);
      setIsStopped(true);
    });

    socket.on(SOCKET_EVENTS.BATCH_COMPLETE, (data: { current_round: number; can_continue: boolean }) => {
      setIsLoading(false);
      setCanContinue(data.can_continue);
      setIsStopped(true);
    });

    setSocket(socket);

    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    const processNextMessage = async () => {
      if (messageQueue.length === 0) {
        setIsProcessingQueue(false);
        return;
      }

      const nextMessage = messageQueue[0];
      setMessages(prev => [...prev, { ...nextMessage, isThinking: true }]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages(prev => 
        prev.map(m => 
          m === prev[prev.length - 1] ? { ...m, isThinking: false, isTyping: true } : m
        )
      );
      setMessageQueue(prev => prev.slice(1));
    };

    if (messageQueue.length > 0 && !isProcessingQueue) {
      setIsProcessingQueue(true);
      processNextMessage();
    }
  }, [messageQueue, isProcessingQueue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || (!prompt.trim() && !isStopped) || !isConnected) return;

    setIsStopRequested(false);
    setIsStopped(false);
    setError(null);
    setIsLoading(true);
    
    if (!isStopped) {
      setMessages([]);
      setCurrentRound(0);
      setTotalRounds(0);
    }
    
    const config: ConversationConfig = {
      prompt,
      personality: Object.keys(AGENT_CONFIGS).find(
        key => AGENT_CONFIGS[key].name === selectedPersonality
      ) || 'SARCASTIC_NETIZEN',
      models: {
        A: selectedModelA,
        B: selectedModelB
      },
      is_continuation: isStopped
    };
    
    socket.emit(SOCKET_EVENTS.START_CONVERSATION, config);
  };

  const handleStopConversation = () => {
    if (socket) {
      socket.emit(SOCKET_EVENTS.STOP_GENERATION);
      setIsStopRequested(true);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100vh', p: 2, bgcolor: '#121212' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#E0E0E0' }}>
        Multi-Agent AI Dating Simulator
      </Typography>

      {!isConnected && (
        <Alert severity="warning">
          Not connected to server. Please wait or refresh the page.
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>选择对话风格</InputLabel>
            <Select
              value={selectedPersonality}
              onChange={(e) => setSelectedPersonality(e.target.value)}
              disabled={isLoading}
              label="选择对话风格"
            >
              {Object.values(AGENT_CONFIGS).map((config) => (
                <MenuItem key={config.name} value={config.name}>
                  {config.name} - {config.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Agent A Model</InputLabel>
              <Select
                value={selectedModelA}
                onChange={(e) => setSelectedModelA(e.target.value)}
                disabled={isLoading}
                label="Agent A Model"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300
                    }
                  }
                }}
              >
                {Object.entries(AI_MODELS).map(([provider, info]) => [
                  <ListSubheader key={provider} sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>
                    {info.name}
                  </ListSubheader>,
                  ...info.versions.map((version) => (
                    <MenuItem 
                      key={version} 
                      value={version}
                      sx={{ pl: 4 }}
                    >
                      {version}
                    </MenuItem>
                  ))
                ]).flat()}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Agent B Model</InputLabel>
              <Select
                value={selectedModelB}
                onChange={(e) => setSelectedModelB(e.target.value)}
                disabled={isLoading}
                label="Agent B Model"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300
                    }
                  }
                }}
              >
                {Object.entries(AI_MODELS).map(([provider, info]) => [
                  <ListSubheader key={provider} sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>
                    {info.name}
                  </ListSubheader>,
                  ...info.versions.map((version) => (
                    <MenuItem 
                      key={version} 
                      value={version}
                      sx={{ pl: 4 }}
                    >
                      {version}
                    </MenuItem>
                  ))
                ]).flat()}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              label="Enter your scenario"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading || !isConnected}
              placeholder="e.g., 在火锅店吃火锅时的对话"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || (!prompt.trim() && !isStopped) || !isConnected || (isStopped && !canContinue)}
            >
              {isStopped ? 'Continue' : 'Start'}
            </Button>
            {isLoading && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleStopConversation}
                disabled={isStopRequested}
              >
                Stop
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography>
              {currentRound > 0 ? `Round ${currentRound} of ${totalRounds}` : 'Starting conversation...'}
            </Typography>
          </Box>
          {totalRounds > 0 && (
            <LinearProgress 
              variant="determinate" 
              value={((currentRound - 1) / totalRounds) * 100} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          )}
        </Box>
      )}

      <Paper 
        sx={{ 
          p: 2, 
          flexGrow: 1, 
          maxHeight: 'calc(100vh - 300px)', 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          background: 'linear-gradient(135deg, #1a472a 0%, #0d253f 100%)',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            },
          },
        }}
      >
        {messages.length === 0 && !isLoading && (
          <Typography color="rgba(255, 255, 255, 0.7)" align="center">
            No conversation yet. Enter a scenario to begin.
          </Typography>
        )}
        
        {messages.map((msg, index) => (
          <Box 
            key={`${msg.round}-${msg.agent}-${index}`} 
            sx={{ 
              p: 2, 
              bgcolor: msg.agent === 'Agent A' ? 'rgba(144, 202, 249, 0.15)' : 'rgba(244, 143, 177, 0.15)',
              borderRadius: 2,
              boxShadow: 1,
              ml: msg.agent === 'Agent B' ? 'auto' : 0,
              mr: msg.agent === 'Agent A' ? 'auto' : 0,
              maxWidth: '80%',
              position: 'relative',
              opacity: msg.isThinking ? 0.7 : 1,
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: msg.agent === 'Agent A' ? 'rgba(144, 202, 249, 0.3)' : 'rgba(244, 143, 177, 0.3)',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '8px',
                borderColor: 'transparent',
                ...(msg.agent === 'Agent A' 
                  ? {
                      left: -16,
                      borderRightColor: 'rgba(144, 202, 249, 0.15)',
                    }
                  : {
                      right: -16,
                      borderLeftColor: 'rgba(244, 143, 177, 0.15)',
                    }
                )
              }
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: msg.agent === 'Agent A' ? '#90CAF9' : '#F48FB1',
                fontWeight: 500,
                mb: 1
              }}
            >
              {msg.agent} - Round {msg.round}
            </Typography>
            <Typography sx={{ 
              whiteSpace: 'pre-wrap', 
              minHeight: '1.5em',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              {msg.isThinking ? (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <CircularProgress size={16} sx={{ color: 'inherit' }} />
                  <span>thinking...</span>
                </Box>
              ) : (
                msg.message
              )}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Paper>
    </Box>
  );
};

export default ChatSimulator; 