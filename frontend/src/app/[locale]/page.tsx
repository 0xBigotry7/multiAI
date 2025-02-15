'use client';

import { useState } from 'react';
import { SingleAIChat } from '@/components/chat/SingleAIChat';

export default function Home() {
  const [selectedModel, setSelectedModel] = useState('gpt-4');

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <SingleAIChat
        selectedAI={selectedModel}
        modelConfig={{}}
        onModelChange={setSelectedModel}
      />
    </main>
  );
} 