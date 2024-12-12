import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import JoinGroup from './components/JoinGroup';
import CreateGroup from './components/CreateGroup';
import Chat from './components/Chat';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/join" element={<JoinGroup />} />
      <Route path="/create" element={<CreateGroup />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/app" element={<Dashboard />} />
      <Route path="/*" element={<Dashboard />} /> {/* Default route */}
    </Routes>
  );
}

export default App;
