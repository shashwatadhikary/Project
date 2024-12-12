// src/components/Dashboard.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, CssBaseline } from '@mui/material';
import Menu from './Menu';
import Home from './Home';
import JoinGroup from './JoinGroup';
import CreateGroup from './CreateGroup';
import Chat from './Chat';

function Dashboard() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Menu />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Study Group Matcher
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="join" element={<JoinGroup />} />
          <Route path="create" element={<CreateGroup />} />
          <Route path="chat" element={<Chat />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default Dashboard;