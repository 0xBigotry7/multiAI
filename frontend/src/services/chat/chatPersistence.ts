import { Message } from '../../types/chat';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: string;
  modelId: string;
  metadata: {
    createdAt: string;
    context?: string;
    summary?: string;
    tags?: string[];
  };
}

class ChatPersistenceService {
  private readonly STORAGE_KEY = 'chat_sessions';
  private readonly MAX_SESSIONS = 50;
  private readonly MAX_CONTEXT_MESSAGES = 10; // Number of messages to keep for context

  private getSessions(): ChatSession[] {
    const sessions = localStorage.getItem(this.STORAGE_KEY);
    return sessions ? JSON.parse(sessions) : [];
  }

  private saveSessions(sessions: ChatSession[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
  }

  private generateSessionTitle(firstMessage: string): string {
    // Generate a title from the first message or use timestamp
    if (firstMessage) {
      const words = firstMessage.split(' ').slice(0, 6).join(' ');
      return words.length < firstMessage.length ? `${words}...` : words;
    }
    return `Chat ${new Date().toLocaleString()}`;
  }

  private updateSessionMetadata(session: ChatSession): void {
    // Update session metadata based on messages
    const messages = session.messages;
    if (messages.length > 0) {
      // Update title if not manually set
      if (!session.title || session.title.startsWith('Chat ')) {
        session.title = this.generateSessionTitle(messages[0].content);
      }

      // Generate context summary from recent messages
      const recentMessages = messages.slice(-this.MAX_CONTEXT_MESSAGES);
      session.metadata.context = recentMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Generate a brief summary (you could use AI for better summarization)
      session.metadata.summary = `${messages.length} messages - Last updated ${new Date().toLocaleString()}`;
    }
  }

  createSession(modelId: string): string {
    const sessions = this.getSessions();
    const id = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id,
      title: `Chat ${new Date().toLocaleString()}`,
      messages: [],
      lastUpdated: new Date().toISOString(),
      modelId,
      metadata: {
        createdAt: new Date().toISOString(),
        context: '',
        summary: 'New conversation',
        tags: []
      }
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
      
      this.updateSessionMetadata(sessions[index]);
      this.saveSessions(sessions);
    }
  }

  addMessageToSession(sessionId: string, message: Message): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    
    if (index !== -1) {
      sessions[index].messages.push(message);
      sessions[index].lastUpdated = new Date().toISOString();
      
      this.updateSessionMetadata(sessions[index]);
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

  getSessionContext(sessionId: string): string {
    const session = this.getSession(sessionId);
    if (!session) return '';

    // Get the last N messages for context
    const contextMessages = session.messages.slice(-this.MAX_CONTEXT_MESSAGES);
    return contextMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  updateSessionTitle(sessionId: string, title: string): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    
    if (index !== -1) {
      sessions[index].title = title;
      sessions[index].lastUpdated = new Date().toISOString();
      this.saveSessions(sessions);
    }
  }

  addSessionTag(sessionId: string, tag: string): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    
    if (index !== -1) {
      // Ensure metadata and tags array exists
      if (!sessions[index].metadata) {
        sessions[index].metadata = {
          createdAt: new Date().toISOString(),
          tags: []
        };
      }
      if (!sessions[index].metadata.tags) {
        sessions[index].metadata.tags = [];
      }
      
      // Now TypeScript knows tags is definitely an array
      const tags = sessions[index].metadata.tags;
      if (Array.isArray(tags) && !tags.includes(tag)) {
        tags.push(tag);
        sessions[index].lastUpdated = new Date().toISOString();
        this.saveSessions(sessions);
      }
    }
  }

  clearAllSessions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const chatPersistence = new ChatPersistenceService(); 