// Chat Types
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isComplete?: boolean;
  isStreamed?: boolean;
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
  onEmojiPickerToggle: () => void;
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
  open: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSessionSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

// Simulator Types
export interface SimulatorMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name: string;
  timestamp: Date;
}

export interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface ConversationConfig {
  prompt: string;
  personality: AgentConfig;
  modelA: string;
  modelB: string;
  mode: 'single' | 'multi';
} 