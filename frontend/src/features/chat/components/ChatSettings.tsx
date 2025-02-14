import React from 'react';
import { Drawer, Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

interface ChatSettingsProps {
  open: boolean;
  onClose: () => void;
  selectedModel: string;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({
  open,
  onClose,
  selectedModel
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
    >
      <Box sx={{ width: 300, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Settings
        </Typography>
        <Divider sx={{ my: 2 }} />
        <List>
          <ListItem>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Selected Model"
              secondary={selectedModel || 'Default'}
            />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}; 