import React from 'react';
import { List, ListItem, ListItemText, Drawer, Box, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Menu() {
  const drawerWidth = 240;
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any authentication data (e.g., token)
    localStorage.removeItem('authToken'); // Example if you're using localStorage
    sessionStorage.removeItem('authToken'); // Example if you're using sessionStorage

    // Redirect to Login page
    navigate('/');
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ padding: 2, backgroundColor: '#FF001B', color: 'white' }}>
        <Typography variant="h6">Study Group Matcher</Typography>
      </Box>
      <List>
        <ListItem button component={Link} to="/home">
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to="/join">
          <ListItemText primary="Join Study Group" />
        </ListItem>
        <ListItem button component={Link} to="/create">
          <ListItemText primary="Create Study Group" />
        </ListItem>
        <ListItem button component={Link} to="/chat">
          <ListItemText primary="Chat" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemText primary="Log Out" />
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Menu;
