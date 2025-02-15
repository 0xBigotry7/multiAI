'use client';

import { useState } from 'react';
import { SingleAIChat } from '@/components/chat/SingleAIChat';
import { Box } from '@mui/material';

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState('gpt-4-0125-preview');

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <SingleAIChat
        selectedAI={selectedModel}
        modelConfig={null}
        onModelChange={setSelectedModel}
      />
    </Box>
  );
} 