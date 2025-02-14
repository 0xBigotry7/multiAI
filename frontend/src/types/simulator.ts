export interface SimulatorMessage {
  round: number;
  agent: string;
  message: string;
  isTyping?: boolean;
  isQueued?: boolean;
  isThinking?: boolean;
}

export interface AgentPersonality {
  role: string;
  goal: string;
  backstory: string;
  traits: string[];
  model?: string;
}

export interface AgentConfig {
  name: string;
  description: string;
  personalities: {
    A: AgentPersonality;
    B: AgentPersonality;
  };
}

export interface ConversationConfig {
  prompt: string;
  personality: string;
  models: {
    A: string;
    B: string;
  };
  is_continuation?: boolean;
} 