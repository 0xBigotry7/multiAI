'use client';

import { useState } from 'react';
import { ChatSimulator } from '@/components/simulator/ChatSimulator';
import { Box } from '@mui/material';

export default function SimulatorPage() {
  const [selectedModel, setSelectedModel] = useState('gpt-4-0125-preview');

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <ChatSimulator
        mode="multi"
        selectedAI={selectedModel}
        modelConfig={null}
        onModelChange={setSelectedModel}
      />
    </Box>
  );
} 