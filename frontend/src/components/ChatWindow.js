import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
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
    });

    newSocket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => newSocket.close();
  }, [user.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();

    if (message.trim() && selectedUser) {
      const messageData = {
        senderId: user.id,
        recipientId: selectedUser,
        content: message,
        timestamp: new Date(),
      };

      socket.emit('send_message', messageData);

      setMessages(prev => [...prev, messageData]);
      setMessage('');
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-100 p-4">
        <h2 className="text-xl mb-4">Online Users</h2>
        <ul>
          {onlineUsers.map(userId => (
            <li
              key={userId}
              className={`cursor-pointer p-2 ${selectedUser === userId ? 'bg-blue-100' : ''}`}
              onClick={() => setSelectedUser(userId)}
            >
              User {userId}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-3/4 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded ${
                msg.senderId === user.id ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
              }`}
              style={{ maxWidth: '70%' }}
            >
              {msg.content}
              <div className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 p-2 border rounded-l"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 rounded-r"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;