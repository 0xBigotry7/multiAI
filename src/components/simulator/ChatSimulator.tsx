import React, { useState, useEffect } from 'react';
import { socketService } from '@/services/socket/socket';
import { SOCKET_EVENTS } from '@/constants/socketEvents';
import type { Message } from '@/types/Message';

interface ChatSimulatorProps {
  mode: string;
  selectedAI: string;
  modelConfig: any;
  onModelChange: (model: string) => void;
}

export const ChatSimulator: React.FC<ChatSimulatorProps> = ({ mode, selectedAI, modelConfig, onModelChange }) => {
  const [socket, setSocket] = useState(socketService.getSocket());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);

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

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (message: Message) => {
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

    // No need to disconnect on cleanup since we're using the singleton service
    return () => {
      // Remove event listeners but don't disconnect
      socket.off(SOCKET_EVENTS.CONNECT);
      socket.off(SOCKET_EVENTS.DISCONNECT);
      socket.off(SOCKET_EVENTS.ERROR);
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE);
      socket.off(SOCKET_EVENTS.CHAT_COMPLETE);
      socket.off(SOCKET_EVENTS.ROUND_UPDATE);
    };
  }, []);

  // ... rest of the component code ...
}; 