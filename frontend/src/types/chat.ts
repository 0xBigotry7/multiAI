export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
}

export interface ModelConfig {
  name: string;
  icon: string;
  models: {
    [key: string]: {
      api_key: string;
      provider: string;
      endpoint?: string;
    };
  };
  features: {
    voice_input: boolean;
    streaming: boolean;
  };
} 