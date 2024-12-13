import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

  const chatBoxRef = useRef(null);

  const configuration = useMemo(() => ({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
    ],
  }), []);

  const handleOffer = useCallback(async (offer) => {
    if (!peerConnection.current) {
      peerConnection.current = new RTCPeerConnection(configuration);

      peerConnection.current.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.send(JSON.stringify({ type: 'ice-candidate', candidate }));
        }
      };

      peerConnection.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };
    }

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.send(JSON.stringify({ type: 'answer', answer }));
  }, [socket, configuration]);

  const handleIceCandidate = useCallback((candidate) => {
    if (peerConnection.current) {
      peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  const handleAnswer = useCallback(async (answer) => {
    if (peerConnection.current) {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  }, []);

  useEffect(() => {
    axios.get(chatHistoryUrl)
      .then((response) => {
        setMessages(response.data.reverse());
      })
      .catch((error) => console.error('Error fetching chat history:', error));

    const newSocket = new WebSocket(socketUrl);
    setSocket(newSocket);

    newSocket.onmessage = (event) => {
      const incomingMessage = JSON.parse(event.data);

      if (incomingMessage.type === 'offer') {
        handleOffer(incomingMessage.offer);
      } else if (incomingMessage.type === 'answer') {
        handleAnswer(incomingMessage.answer);
      } else if (incomingMessage.type === 'ice-candidate') {
        handleIceCandidate(incomingMessage.candidate);
      } else if (incomingMessage.type === 'chat') {
        setMessages((prevMessages) => [...prevMessages, incomingMessage]);
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    };

    return () => {
      newSocket.close();
    };
  }, [handleOffer, handleAnswer, handleIceCandidate]);

  const startCall = async () => {
    peerConnection.current = new RTCPeerConnection(configuration);

    peerConnection.current.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.send(JSON.stringify({ type: 'ice-candidate', candidate }));
      }
    };

    peerConnection.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });
    localVideoRef.current.srcObject = stream;

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.send(JSON.stringify({ type: 'offer', offer }));
  };

  const handleSendMessage = () => {
    if (!username || !message) {
      alert('Please enter a username and a message.');
      return;
    }

    const newMessage = { type: 'chat', username, text: message };

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
      <h4 style={{ textAlign: 'center' }}>Group Chat with Video Call</h4>
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
      <button onClick={startCall} style={{ width: '100%', padding: '10px', marginBottom: '20px' }}>
        Start Video Call
      </button>
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
