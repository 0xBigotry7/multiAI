import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Message } from '../../../types/chat';
import { socketService } from '../../../services/socket/socket';
import { SOCKET_EVENTS } from '../../../services/socket/events';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

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

    socket.on(SOCKET_EVENTS.MESSAGE, (data: { content: string }) => {
      console.log('Received message:', data);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    });

    socket.on(SOCKET_EVENTS.ERROR, (data: { message: string }) => {
      console.error('Server error:', data.message);
      setError(data.message);
      setIsLoading(false);
    });

    setSocket(socket);

    return () => {
      socketService.disconnect();
    };
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (!message.trim() || !socket || !isConnected || isLoading) return;

    const newMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    console.log('Sending message:', message);
    socket.emit(SOCKET_EVENTS.SINGLE_AI_MESSAGE, { message });
  }, [socket, isConnected, isLoading]);

  const stopGeneration = useCallback(() => {
    if (socket) {
      socket.emit(SOCKET_EVENTS.STOP_GENERATION);
      setIsLoading(false);
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
    setError
  };
}; 