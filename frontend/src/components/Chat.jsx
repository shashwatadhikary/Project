import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const socketUrl = "wss://project-1-m2bn.onrender.com"; // WebSocket URL
const chatHistoryUrl = "https://project-1-m2bn.onrender.com/api/chats"; // REST API for fetching chat history

function Chat() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  const chatBoxRef = useRef(null);

  useEffect(() => {
    // Fetch existing chat messages from the backend
    axios
      .get(chatHistoryUrl)
      .then((response) => {
        setMessages(response.data.reverse());
      })
      .catch((error) => console.error('Error fetching chat history:', error));

    // Establish WebSocket connection
    const newSocket = new WebSocket(socketUrl);
    setSocket(newSocket);

    // Listen for incoming WebSocket messages
    newSocket.onmessage = (event) => {
      const incomingMessage = JSON.parse(event.data);

      if (incomingMessage.type === 'chat') {
        setMessages((prevMessages) => [...prevMessages, incomingMessage]);
        // Scroll to the bottom of the chat box
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      newSocket.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (!username || !message) {
      alert('Please enter a username and a message.');
      return;
    }

    const newMessage = { type: 'chat', username, text: message };

    // Send the message to the WebSocket server
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(newMessage));
    }

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage('');

    setTimeout(() => {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }, 100);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h4 style={{ textAlign: 'center' }}>Group Chat</h4>
      <input
        type="text"
        placeholder="Your Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <div
        ref={chatBoxRef}
        style={{
          border: '1px solid #ccc',
          borderRadius: '5px',
          height: '300px',
          overflowY: 'scroll',
          padding: '10px',
          marginBottom: '10px',
          backgroundColor: '#f9f9f9',
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: msg.username === username ? 'flex-end' : 'flex-start',
              margin: '5px 0',
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                backgroundColor: msg.username === username ? '#DCF8C6' : '#FFF',
                padding: '10px',
                borderRadius: '10px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              <p style={{ margin: 0, fontWeight: 'bold' }}>{msg.username}</p>
              <p style={{ margin: 0 }}>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      <textarea
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px', height: '50px' }}
      ></textarea>
      <button onClick={handleSendMessage} style={{ width: '100%', padding: '10px' }}>
        Send
      </button>
    </div>
  );
}

export default Chat;
