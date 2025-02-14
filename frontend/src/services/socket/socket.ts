import { io, Socket } from 'socket.io-client';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(): Socket {
    if (!this.socket || !this.isInitialized) {
      this.socket = io('http://localhost:5000', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });
      
      this.socket.on('connect', () => {
        console.log('Socket connected with ID:', this.socket?.id);
        this.isInitialized = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.isInitialized = false;
      });

      this.isInitialized = true;
    }
    return this.socket;
  }

  disconnect(): void {
    if (this.socket && this.isInitialized) {
      this.socket.disconnect();
      this.socket = null;
      this.isInitialized = false;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create a single instance that will be used throughout the app
export const socketService = SocketService.getInstance(); 