// src/components/Chat.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

function Chat() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Group Chat</Typography>
      <iframe
        src="https://your-chat-service-url.com/chat-room-id"
        style={{ width: '100%', height: '500px', border: 'none' }}
        title="Group Chat"
      ></iframe>
    </Box>
  );
}

export default Chat;
