import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Message } from '../../../types/chat';
import { socketService } from '../../../services/socket/socket';
import { SOCKET_EVENTS } from '../../../services/socket/events';
import { chatPersistence, ChatSession } from '../../../services/chat/chatPersistence';

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
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isTypingResponse, setIsTypingResponse] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Load sessions on mount
  useEffect(() => {
    const loadedSessions = chatPersistence.getAllSessions();
    setSessions(loadedSessions);
  }, []);

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

      const newMessage: Message = {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };

      setMessages(prev => {
        const updated = [...prev, newMessage];
        if (sessionId) {
          chatPersistence.addMessageToSession(sessionId, newMessage);
        }
        return updated;
      });

      setIsLoading(false);

      setTimeout(() => {
        setIsTypingResponse(false);
        if (options.onTypingEnd) {
          options.onTypingEnd();
        }
        if (options.onMessage) {
          options.onMessage(data.content);
        }
      }, Math.min(data.content.length * 30, 3000));
    });

    socket.on('messageStream', (data: { content: string; isComplete: boolean }) => {
      console.log('Received message stream:', data);
      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          // Update existing assistant message
          const content = lastMessage.content;
          const newContent = content + data.content;
          lastMessage.content = newContent;

          if (data.isComplete && sessionId) {
            // Only store assistant message when complete
            lastMessage.content = lastMessage.content.replace(/\s+/g, ' ').trim();
            chatPersistence.addMessageToSession(sessionId, lastMessage);
          }
        } else {
          // Create new assistant message
          const newMessage: Message = {
            role: 'assistant',
            content: data.content,
            timestamp: new Date()
          };
          updated.push(newMessage);
          // Don't store yet - wait for complete flag
          if (data.isComplete && sessionId) {
            chatPersistence.addMessageToSession(sessionId, newMessage);
          }
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
  }, [options, sessionId]);

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

    // Add message to state and persistence
    setMessages(prev => {
      const updated = [...prev, newMessage];
      if (sessionId) {
        // Store user message immediately
        chatPersistence.addMessageToSession(sessionId, newMessage);
      }
      return updated;
    });

    setInputMessage('');
    setIsLoading(true);
    setError(null);
    setIsTypingResponse(true);

    // Get context from previous messages
    const context = sessionId ? chatPersistence.getSessionContext(sessionId) : '';

    // Send message with context and model
    socket.emit('singleAIMessage', { 
      message,
      context,
      session_id: sessionId,
      model: selectedModel
    });
  }, [socket, isConnected, options, sessionId, selectedModel]);

  const createNewSession = useCallback((modelId: string) => {
    const newSessionId = chatPersistence.createSession(modelId);
    setSessionId(newSessionId);
    setMessages([]);
    setSessions(chatPersistence.getAllSessions());
    return newSessionId;
  }, []);

  const loadSession = useCallback((id: string) => {
    const session = chatPersistence.getSession(id);
    if (session) {
      setSessionId(id);
      // Convert string timestamps to Date objects
      const messagesWithDates = session.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(messagesWithDates);
      setInputMessage(''); // Clear input message
      setIsLoading(false); // Reset loading state
      setIsTypingResponse(false); // Reset typing state
      setError(null); // Clear any errors
    }
  }, []);

  const deleteSession = useCallback((id: string) => {
    chatPersistence.deleteSession(id);
    if (id === sessionId) {
      setSessionId('');
      setMessages([]);
    }
    setSessions(chatPersistence.getAllSessions());
  }, [sessionId]);

  const updateSessionTitle = useCallback((id: string, title: string) => {
    chatPersistence.updateSessionTitle(id, title);
    setSessions(chatPersistence.getAllSessions());
  }, []);

  const addSessionTag = useCallback((id: string, tag: string) => {
    chatPersistence.addSessionTag(id, tag);
    setSessions(chatPersistence.getAllSessions());
  }, []);

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
    updateSessionTitle,
    addSessionTag,
    isTypingResponse,
    selectedModel,
    setSelectedModel
  };
}; 