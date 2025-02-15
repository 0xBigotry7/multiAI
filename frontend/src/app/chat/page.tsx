'use client';

import { SingleAIChat } from '@/components/chat/SingleAIChat';

export default function ChatPage() {
  return <SingleAIChat selectedAI="gpt-4-0125-preview" modelConfig={null} onModelChange={() => {}} />;
} 