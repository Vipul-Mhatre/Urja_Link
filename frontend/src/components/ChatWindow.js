import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import config from '../config/config';

function ChatWindow() {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io(config.socketUrl);
    setSocket(newSocket);

    newSocket.emit('user_connected', user.id);

    newSocket.on('users_online', (users) => {
      setOnlineUsers(users.filter(id => id !== user.id));
    });

    newSocket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => newSocket.close();
  }, [user.id]);

  // ... rest of the component code remains the same
}

export default ChatWindow;