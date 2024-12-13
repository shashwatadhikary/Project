import React, { useState, useEffect } from 'react';

const socketUrl = "ws://your-backend-url/chat"; // Replace with your WebSocket backend URL

function Chat() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  // Establish WebSocket connection
  useEffect(() => {
    const newSocket = new WebSocket(socketUrl);
    setSocket(newSocket);

    // Listen for incoming messages
    newSocket.onmessage = (event) => {
      const incomingMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, incomingMessage]);
    };

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (!username || !message) {
      alert('Please enter a username and a message.');
      return;
    }

    const newMessage = { username, text: message };
    // Send the message to the WebSocket server
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(newMessage));
    }

    // Clear the input field
    setMessage('');
  };

  return (
    <div>
      <h4>Group Chat</h4>
      <input
        type="text"
        placeholder="Your Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginBottom: '10px', width: '100%' }}
      />
      <textarea
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: '100%', marginBottom: '10px' }}
      ></textarea>
      <button onClick={handleSendMessage} style={{ marginBottom: '10px' }}>
        Send
      </button>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.username}: </strong>{msg.text}
          </p>
        ))}
      </div>
    </div>
  );
}

export default Chat;
