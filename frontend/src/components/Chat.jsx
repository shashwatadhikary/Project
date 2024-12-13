import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const socketUrl = "wss://project-1-m2bn.onrender.com"; // WebSocket URL
const chatHistoryUrl = "https://project-1-m2bn.onrender.com/api/chats"; // REST API for fetching chat history

function Chat() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  // WebRTC configuration
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' } // Google's public STUN server
    ],
  };

  // WebRTC: Handle incoming offer
  const handleOffer = useCallback(async (offer) => {
    if (!peerConnection.current) {
      peerConnection.current = new RTCPeerConnection(configuration);

      // Handle ICE candidates
      peerConnection.current.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.send(JSON.stringify({ type: 'ice-candidate', candidate }));
        }
      };

      // Set up remote video
      peerConnection.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };
    }

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    // Send the answer back to the caller
    socket.send(JSON.stringify({ type: 'answer', answer }));
  }, [socket]);

  // WebRTC: Handle ICE candidates
  const handleIceCandidate = useCallback((candidate) => {
    if (peerConnection.current) {
      peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  // WebRTC: Handle incoming answer
  const handleAnswer = useCallback(async (answer) => {
    if (peerConnection.current) {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  }, []);

  // Fetch existing chats and establish WebSocket connection
  useEffect(() => {
    // Fetch existing chat messages from the backend
    axios.get(chatHistoryUrl)
      .then((response) => {
        setMessages(response.data.reverse()); // Show the latest messages at the top
      })
      .catch((error) => console.error('Error fetching chat history:', error));

    // Establish WebSocket connection
    const newSocket = new WebSocket(socketUrl);
    setSocket(newSocket);

    // Listen for incoming WebSocket messages
    newSocket.onmessage = (event) => {
      const incomingMessage = JSON.parse(event.data);

      // Handle signaling messages for WebRTC
      if (incomingMessage.type === 'offer') {
        handleOffer(incomingMessage.offer);
      } else if (incomingMessage.type === 'answer') {
        handleAnswer(incomingMessage.answer);
      } else if (incomingMessage.type === 'ice-candidate') {
        handleIceCandidate(incomingMessage.candidate);
      } else {
        // Add chat messages to the top
        setMessages((prevMessages) => [incomingMessage, ...prevMessages]);
      }
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      newSocket.close();
    };
  }, [handleOffer, handleAnswer, handleIceCandidate]);

  // Start a video call
  const startCall = async () => {
    peerConnection.current = new RTCPeerConnection(configuration);

    // Handle ICE candidates
    peerConnection.current.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.send(JSON.stringify({ type: 'ice-candidate', candidate }));
      }
    };

    // Set up remote video
    peerConnection.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // Get user media (video + audio)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });
    localVideoRef.current.srcObject = stream;

    // Create and send offer
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.send(JSON.stringify({ type: 'offer', offer }));
  };

  // Send chat messages
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
    setMessage(''); // Clear the input field
  };

  return (
    <div>
      <h4>Group Chat with Video Call</h4>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          style={{ width: '300px', border: '1px solid black' }}
        ></video>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: '300px', border: '1px solid black' }}
        ></video>
      </div>
      <button onClick={startCall} style={{ marginBottom: '20px' }}>
        Start Video Call
      </button>
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
