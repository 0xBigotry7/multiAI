'use client';

import { useState } from 'react';
import { SingleAIChat } from '@/features/chat/SingleAIChat';
import ChatSimulator from '@/features/simulator/ChatSimulator';

export default function Home() {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentModel, setCurrentModel] = useState('gpt-4o-mini');

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 0:
        return (
          <SingleAIChat 
            selectedAI={currentModel}
            modelConfig={null}
            onModelChange={setCurrentModel}
          />
        );
      case 1:
        return (
          <ChatSimulator 
            mode="multi" 
            selectedAI={currentModel} 
            modelConfig={null}
            onModelChange={setCurrentModel}
          />
        );
      case 2:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Interactive Scene Mode (Coming Soon)
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-900">
      {renderCurrentTab()}
    </main>
  );
} 