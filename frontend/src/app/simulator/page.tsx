'use client';

import { ChatSimulator } from '@/components/simulator/ChatSimulator';

export default function SimulatorPage() {
  return <ChatSimulator mode="multi" selectedAI="gpt-4-0125-preview" modelConfig={null} onModelChange={() => {}} />;
} 