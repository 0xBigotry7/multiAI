export interface Message {
  content: string;
  agent?: string;
  isComplete?: boolean;
  timestamp?: number;
  role?: 'user' | 'assistant' | 'system';
  metadata?: {
    round?: number;
    total?: number;
    can_continue?: boolean;
  };
} 