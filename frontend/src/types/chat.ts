export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  name?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  model: string;
}

export interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isLoading: boolean;
  showEmojiPicker: boolean;
  onEmojiClick: () => void;
  onEmojiSelect: (emoji: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

export interface ChatSettingsProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
  onDarkModeChange: (isDark: boolean) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  isLoggedIn: boolean;
  username?: string;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
}

export interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSessionSelect: (id: string) => void;
  onSessionDelete: (id: string) => void;
  onNewChat: () => void;
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