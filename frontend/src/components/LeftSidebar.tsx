import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  Box,
  Typography,
  Collapse
} from '@mui/material';
import {
  History as HistoryIcon,
  SmartToy as AIIcon,
  ExpandLess,
  ExpandMore,
  Chat as ChatIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
}

interface LeftSidebarProps {
  open: boolean;
  onClose: () => void;
  chatHistory: ChatHistoryItem[];
  onHistoryItemClick: (id: string) => void;
  onHistoryItemDelete: (id: string) => void;
  selectedAI: string;
  onAISelect: (ai: string) => void;
  modelConfig: any;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  open,
  onClose,
  chatHistory,
  onHistoryItemClick,
  onHistoryItemDelete,
  selectedAI,
  onAISelect,
  modelConfig
}) => {
  const [historyOpen, setHistoryOpen] = React.useState(true);
  const [aiSelectOpen, setAISelectOpen] = React.useState(false);

  const handleHistoryClick = () => {
    setHistoryOpen(!historyOpen);
  };

  const handleAISelectClick = () => {
    setAISelectOpen(!aiSelectOpen);
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          bgcolor: 'background.paper',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          菜单
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItemButton onClick={handleHistoryClick}>
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary="对话记录" />
          {historyOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={historyOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {chatHistory.map((item) => (
              <ListItem
                key={item.id}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => onHistoryItemDelete(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{ pl: 4 }}
              >
                <ListItemButton onClick={() => onHistoryItemClick(item.id)}>
                  <ListItemIcon>
                    <ChatIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title}
                    secondary={item.timestamp} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>

        <ListItemButton onClick={handleAISelectClick}>
          <ListItemIcon>
            <AIIcon />
          </ListItemIcon>
          <ListItemText primary="AI选择" />
          {aiSelectOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={aiSelectOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {modelConfig?.providers && Object.entries(modelConfig.providers).map(([providerId, provider]: [string, any]) => (
              <ListItem key={providerId} sx={{ pl: 4 }}>
                <ListItemButton onClick={() => onAISelect(providerId)}>
                  <ListItemIcon>
                    <Box
                      component="img"
                      src={provider.icon}
                      alt={provider.name}
                      sx={{ width: 24, height: 24 }}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={provider.name}
                    secondary={
                      provider.features?.voice_input ? "支持语音输入" : undefined
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
};

export default LeftSidebar; 