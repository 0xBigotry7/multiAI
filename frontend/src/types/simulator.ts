export interface SimulatorMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name: string;
  timestamp: Date;
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
} 