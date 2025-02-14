import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Message } from '../../../types/chat';
import { socketService } from '../../../services/socket/socket';
import { SOCKET_EVENTS } from '../../../services/socket/events';
import { chatPersistence } from '../../../services/chat/chatPersistence';

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  currentRetry: number;
}

interface UseChatOptions {
  onMessage?: (message: string) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
}

export const useChat = (options: UseChatOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [sessions, setSessions] = useState<{ id: string; title: string; lastUpdated: string }[]>([]);
  const [retryConfig, setRetryConfig] = useState<RetryConfig>({
    maxRetries: 3,
    retryDelay: 1000,
    currentRetry: 0
  });
  const [isRetrying, setIsRetrying] = useState(false);
  const [isTypingResponse, setIsTypingResponse] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    const loadedSessions = chatPersistence.getAllSessions();
    setSessions(loadedSessions.map(({ id, title, lastUpdated }) => ({ id, title, lastUpdated })));
  }, []);

  // Load session messages if sessionId is provided
  useEffect(() => {
    if (sessionId) {
      const session = chatPersistence.getSession(sessionId);
      if (session) {
        setMessages(session.messages);
      }
    }
  }, [sessionId]);

  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setError('Connection lost');
    });

    socket.on('message', (data: { content: string }) => {
      console.log('Received message:', data);
      if (options.onTypingStart) {
        options.onTypingStart();
      }
      setIsTypingResponse(true);

      // Create new message with the full content
      const newMessage: Message = {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setIsLoading(false);

      // End typing after a delay based on message length
      setTimeout(() => {
        setIsTypingResponse(false);
        if (options.onTypingEnd) {
          options.onTypingEnd();
        }
        if (options.onMessage) {
          options.onMessage(data.content);
        }
      }, Math.min(data.content.length * 30, 3000)); // Cap maximum delay at 3 seconds
    });

    socket.on('messageStream', (data: { content: string; isComplete: boolean }) => {
      console.log('Received message stream:', data);
      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content += data.content;
        } else {
          // If no existing message, create a new one
          updated.push({
            role: 'assistant',
            content: data.content,
            timestamp: new Date()
          });
        }
        return updated;
      });

      if (data.isComplete) {
        setIsTypingResponse(false);
        setIsLoading(false);
        if (options.onTypingEnd) {
          options.onTypingEnd();
        }
      }
    });

    socket.on('error', (data: { message: string }) => {
      console.error('Server error:', data.message);
      setError(data.message);
      setIsLoading(false);
      setIsTypingResponse(false);
    });

    setSocket(socket);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('message');
      socket.off('messageStream');
      socket.off('error');
    };
  }, [options]);

  const sendMessage = useCallback((message: string) => {
    if (!socket || !isConnected) {
      console.error('Not connected to server');
      return;
    }

    if (options.onTypingStart) {
      options.onTypingStart();
    }

    const newMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    setIsTypingResponse(true);

    socket.emit('singleAIMessage', { message });
  }, [socket, isConnected, options]);

  const createNewSession = useCallback((modelId: string) => {
    const newSessionId = chatPersistence.createSession(modelId);
    setSessionId(newSessionId);
    setMessages([]);
    const loadedSessions = chatPersistence.getAllSessions();
    setSessions(loadedSessions.map(({ id, title, lastUpdated }) => ({ id, title, lastUpdated })));
    return newSessionId;
  }, []);

  const loadSession = useCallback((id: string) => {
    const session = chatPersistence.getSession(id);
    if (session) {
      setSessionId(id);
      setMessages(session.messages);
    }
  }, []);

  const deleteSession = useCallback((id: string) => {
    chatPersistence.deleteSession(id);
    if (id === sessionId) {
      setSessionId('');
      setMessages([]);
    }
    const loadedSessions = chatPersistence.getAllSessions();
    setSessions(loadedSessions.map(({ id, title, lastUpdated }) => ({ id, title, lastUpdated })));
  }, [sessionId]);

  const stopGeneration = useCallback(() => {
    if (socket) {
      socket.emit(SOCKET_EVENTS.STOP_GENERATION);
      setIsLoading(false);
      setIsTypingResponse(false);
    }
  }, [socket]);

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    error,
    isConnected,
    sendMessage,
    stopGeneration,
    setError,
    sessions,
    sessionId,
    createNewSession,
    loadSession,
    deleteSession,
    isRetrying,
    isTypingResponse
  };
}; 