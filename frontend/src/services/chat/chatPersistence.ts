import { Message } from '../../types/chat';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: string;
  modelId: string;
}

class ChatPersistenceService {
  private readonly STORAGE_KEY = 'chat_sessions';
  private readonly MAX_SESSIONS = 50;

  private getSessions(): ChatSession[] {
    const sessions = localStorage.getItem(this.STORAGE_KEY);
    return sessions ? JSON.parse(sessions) : [];
  }

  private saveSessions(sessions: ChatSession[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
  }

  createSession(modelId: string): string {
    const sessions = this.getSessions();
    const id = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id,
      title: 'New Chat',
      messages: [],
      lastUpdated: new Date().toISOString(),
      modelId
    };

    // Add new session and maintain max limit
    sessions.unshift(newSession);
    if (sessions.length > this.MAX_SESSIONS) {
      sessions.pop();
    }
    
    this.saveSessions(sessions);
    return id;
  }

  updateSession(sessionId: string, updates: Partial<ChatSession>): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    
    if (index !== -1) {
      sessions[index] = {
        ...sessions[index],
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      
      // If title is empty and there are messages, use first message as title
      if (!sessions[index].title && sessions[index].messages.length > 0) {
        sessions[index].title = sessions[index].messages[0].content.slice(0, 30) + '...';
      }
      
      this.saveSessions(sessions);
    }
  }

  getSession(sessionId: string): ChatSession | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  deleteSession(sessionId: string): void {
    const sessions = this.getSessions();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    this.saveSessions(filteredSessions);
  }

  getAllSessions(): ChatSession[] {
    return this.getSessions();
  }

  addMessageToSession(sessionId: string, message: Message): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    
    if (index !== -1) {
      sessions[index].messages.push(message);
      sessions[index].lastUpdated = new Date().toISOString();
      
      // Update title if it's the first message
      if (!sessions[index].title && message.role === 'user') {
        sessions[index].title = message.content.slice(0, 30) + '...';
      }
      
      this.saveSessions(sessions);
    }
  }

  clearAllSessions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const chatPersistence = new ChatPersistenceService(); 