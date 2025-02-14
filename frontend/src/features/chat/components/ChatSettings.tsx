import React from 'react';
import { Drawer, Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, ListItemButton } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { AI_MODELS } from '../../../config/agentPersonalities';

interface ChatSettingsProps {
  open: boolean;
  onClose: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({
  open,
  onClose,
  selectedModel,
  onModelChange
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
              primary="Model Selection"
              secondary="Choose your AI model"
            />
          </ListItem>
          <Divider />
          {Object.entries(AI_MODELS).map(([provider, info]) => (
            <React.Fragment key={provider}>
              <ListItem>
                <ListItemText
                  primary={info.name}
                  sx={{ fontWeight: 'bold' }}
                />
              </ListItem>
              {info.versions.map((version) => (
                <ListItemButton
                  key={version}
                  selected={selectedModel === version}
                  onClick={() => onModelChange(version)}
                  sx={{ pl: 4 }}
                >
                  <ListItemText 
                    primary={version}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: selectedModel === version ? 'primary' : 'text.primary'
                    }}
                  />
                </ListItemButton>
              ))}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}; 