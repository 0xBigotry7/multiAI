export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Chat events
  SINGLE_AI_MESSAGE: 'singleAIMessage',
  MESSAGE: 'message',
  STOP_GENERATION: 'stopGeneration',

  // Simulator events
  START_CONVERSATION: 'startConversation',
  CONVERSATION_UPDATE: 'conversationUpdate',
  CONVERSATION_COMPLETE: 'conversationComplete',
  CONVERSATION_STOPPED: 'conversationStopped',
  BATCH_COMPLETE: 'batchComplete',
  ROUND_UPDATE: 'roundUpdate',
  AGENT_TYPING: 'agentTyping',

  // History events
  GET_CHAT_HISTORY: 'getChatHistory',
  CHAT_HISTORY: 'chatHistory',
  CLEAR_CHAT_HISTORY: 'clearChatHistory',
  CHAT_HISTORY_CLEARED: 'chatHistoryCleared',

  // Config events
  GET_MODEL_CONFIG: 'getModelConfig',
  MODEL_CONFIG: 'modelConfig',

  // Error events
  ERROR: 'error'
} as const; 