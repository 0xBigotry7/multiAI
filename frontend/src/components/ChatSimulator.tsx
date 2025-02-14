import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, TextField, Button, Paper, Typography, CircularProgress, Alert, LinearProgress, Select, MenuItem, FormControl, InputLabel, ListSubheader } from '@mui/material';
import io, { Socket } from 'socket.io-client';
import { AGENT_CONFIGS, DEFAULT_CONFIG, AI_MODELS } from '../config/agentPersonalities';

interface Message {
  round: number;
  agent: string;
  message: string;
  isTyping?: boolean;
  isQueued?: boolean;
  isThinking?: boolean;
}

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 30, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <>{displayedText}</>;
};

const DEBUG = true;

const log = {
  info: (...args: any[]) => {
    if (DEBUG) console.log('%c[INFO]', 'color: blue; font-weight: bold', ...args);
  },
  error: (...args: any[]) => {
    if (DEBUG) console.error('%c[ERROR]', 'color: red; font-weight: bold', ...args);
  },
  debug: (...args: any[]) => {
    if (DEBUG) console.debug('%c[DEBUG]', 'color: green; font-weight: bold', ...args);
  },
  state: (...args: any[]) => {
    if (DEBUG) console.log('%c[STATE]', 'color: purple; font-weight: bold', ...args);
  }
};

const ThinkingDots: React.FC = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return <span>thinking{dots}</span>;
};

interface ConversationConfig {
  prompt: string;
  personality: string;
  models: {
    A: string;
    B: string;
  };
  is_continuation?: boolean;
}

interface ChatSimulatorProps {
  mode: 'single' | 'multi';
  selectedAI: string;
  modelConfig: any;
}

const ChatSimulator: React.FC<ChatSimulatorProps> = ({ mode, selectedAI, modelConfig }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState(DEFAULT_CONFIG.name);
  const [selectedModelA, setSelectedModelA] = useState("gpt-4o-mini");
  const [selectedModelB, setSelectedModelB] = useState("deepseek-r1");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);
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

  // Process the message queue
  useEffect(() => {
    const processNextMessage = async () => {
      if (messageQueue.length === 0) {
        setIsProcessingQueue(false);
        return;
      }

      const nextMessage = messageQueue[0];
      
      // Add message with thinking state first
      setMessages(prev => [...prev, { ...nextMessage, isThinking: true }]);
      
      // Wait for 1 second with thinking animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update to typing state
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

  useEffect(() => {
    log.info('Initializing socket connection...');
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      log.info('Socket connected successfully');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      log.error('Socket disconnected');
      setIsConnected(false);
      setError('Disconnected from server');
    });

    newSocket.on('connect_error', (err) => {
      log.error('Socket connection error:', err);
      setIsConnected(false);
      setError('Failed to connect to server. Please make sure the backend is running.');
      setIsLoading(false);
    });

    newSocket.on('roundUpdate', (data: { round: number; total: number; can_continue: boolean }) => {
      log.debug('Received round update:', data);
      setCurrentRound(prev => {
        log.state('Updating currentRound:', prev, '->', data.round);
        return data.round;
      });
      setTotalRounds(prev => {
        log.state('Updating totalRounds:', prev, '->', data.total);
        return data.total;
      });
      setCanContinue(data.can_continue);
    });

    newSocket.on('conversationUpdate', (data: Message) => {
      log.info('Received message:', data);
      setMessageQueue(prev => [...prev, data]);
    });

    newSocket.on('conversationComplete', () => {
      log.info('Conversation complete');
      setIsLoading(false);
      setCanContinue(false);
      setIsStopped(false);
    });

    newSocket.on('error', (error: { message: string }) => {
      log.error('Received error from server:', error);
      setError(error.message);
      setIsLoading(false);
    });

    newSocket.on('conversationStopped', (data: { current_round: number; can_continue: boolean }) => {
      log.info('Conversation stopped by user');
      setIsLoading(false);
      setIsStopRequested(false);
      setCanContinue(data.can_continue);
      setIsStopped(true);
    });

    newSocket.on('batchComplete', (data: { current_round: number; can_continue: boolean }) => {
      log.info('Batch complete:', data);
      setIsLoading(false);
      setCanContinue(data.can_continue);
      setIsStopped(true);
    });

    setSocket(newSocket);

    return () => {
      log.info('Cleaning up socket connection');
      newSocket.close();
    };
  }, [scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || (!prompt.trim() && !isStopped) || !isConnected) {
      log.error('Cannot submit:', { socketExists: !!socket, promptExists: !!prompt.trim(), isConnected });
      return;
    }

    setIsStopRequested(false);
    setIsStopped(false);
    log.info('Submitting prompt:', prompt);
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
    
    socket.emit('startConversation', config, () => {
      log.debug('startConversation event emitted successfully');
    });
  };

  const getProgress = () => {
    if (totalRounds === 0) return 0;
    return ((currentRound - 1) / totalRounds) * 100;
  };

  // Handle message typing completion
  const handleMessageComplete = useCallback((completedMessage: Message) => {
    setMessages(prev => 
      prev.map(m => 
        m === completedMessage ? { ...m, isTyping: false } : m
      )
    );
    setIsProcessingQueue(false);
  }, []);

  // Add stop conversation handler
  const handleStopConversation = useCallback(() => {
    if (socket) {
      socket.emit('stopConversation');
      setIsStopRequested(true);
    }
  }, [socket]);

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
              value={getProgress()} 
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
                  <ThinkingDots />
                </Box>
              ) : msg.isTyping ? (
                <Typewriter 
                  text={msg.message} 
                  speed={30}
                  onComplete={() => handleMessageComplete(msg)}
                />
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