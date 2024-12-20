import { useEffect, useRef, useState } from 'react';
import journalist from '../../assets/journalist.png';
import vipul from '../../assets/vipul.jpeg'
import employee from '../../assets/employee.png';

import Input from '../../components/Input';
import { io } from 'socket.io-client';

const Dashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')));
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const messageRef = useRef(null);

  useEffect(() => {
    setSocket(io('http://localhost:8080'));  
  }, []);

  useEffect(() => {
    if (socket && user) {
      const handleMessage = (data) => {
        setMessages((prevMessages) => {
          if (prevMessages.messages.some((msg) => msg.id === data.id)) {
            return prevMessages; // Avoid duplicate
          }
          return {
            ...prevMessages,
            messages: [...prevMessages.messages, data],
          };
        });
      };
  
      socket.emit('addUser', user?.id);
      socket.on('getMessage', handleMessage);
  
      return () => {
        socket.off('getMessage', handleMessage); // Cleanup listener
      };
    }
  }, [socket, user]);
  

  useEffect(() => {
    messageRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.messages]);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user:detail'));
    const fetchConversations = async () => {
      const res = await fetch(`http://localhost:8000/api/conversations/${loggedInUser?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const resData = await res.json();
      setConversations(resData);
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`http://localhost:8000/api/users/${user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const resData = await res.json();
      setUsers(resData);
    };
    fetchUsers();
  }, [user]);

  const fetchMessages = async (conversationId, receiver) => {
    const res = await fetch(
      `http://localhost:8000/api/message/${conversationId}?senderId=${user?.id}&&receiverId=${receiver?.receiverId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const resData = await res.json();
    setMessages({ messages: resData, receiver, conversationId });
  };

  const sendMessage = async () => {
    if (!message) return;
  
    const newMessage = {
      senderId: user?.id,
      receiverId: messages?.receiver?.receiverId,
      message,
      conversationId: messages?.conversationId,
      bgClass: 'bg-primary text-white rounded-tl-xl ml-auto', // Styling for sent messages
    };
  
    // Emit the message through WebSocket
    socket.emit('sendMessage', newMessage);
  
    // Optimistically update the local state
    setMessages((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, { ...newMessage, id: Date.now() }], // Temporary ID for UI rendering
    }));
  
    setMessage(''); // Clear the input field
  
    try {
      // Save the message to the server
      await fetch(`http://localhost:8000/api/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  
  useEffect(() => {
    if (socket && user) {
      const handleMessage = (data) => {
        setMessages((prevMessages) => ({
          ...prevMessages,
          messages: [...prevMessages.messages, data],
        }));
      };
  
      socket.emit('addUser', user?.id);
      socket.on('getMessage', handleMessage);
  
      return () => {
        socket.off('getMessage', handleMessage); // Cleanup listener
      };
    }
  }, [socket, user]);
  

  return (
    <div className="w-screen flex">
      <div className="w-[25%] h-screen bg-secondary overflow-scroll">
        <div className="flex items-center my-8 mx-14">
          <div>
            <img
              src={vipul}
              width={75}
              height={75}
              className="border border-primary p-[2px] rounded-full"
            />
          </div>
          <div className="ml-8">
            <h3 className="text-2xl">{user?.fullName}</h3>
            <p className="text-lg font-light">My Account</p>
          </div>
        </div>
        <hr />
        <div className="mx-14 mt-10">
          <div className="text-primary text-lg">Messages</div>
          <div>
            {conversations.length > 0 ? (
              conversations.map(({ conversationId, user }) => (
                <div className="flex items-center py-8 border-b border-b-gray-300" key={conversationId}>
                  <div
                    className="cursor-pointer flex items-center"
                    onClick={() => fetchMessages(conversationId, user)}
                  >
                    <div>
                      <img
                        src={journalist}
                        className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary"
                      />
                    </div>
                    <div className="ml-6">
                      <h3 className="text-lg font-semibold">{user?.fullName}</h3>
                      <p className="text-sm font-light text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-lg font-semibold mt-24">No Conversations</div>
            )}
          </div>
        </div>
      </div>

      <div className="w-[50%] h-screen bg-white flex flex-col items-center">
        {messages?.receiver?.fullName && (
          <div className="w-[75%] bg-secondary h-[80px] my-14 rounded-full flex items-center px-14 py-2">
            <div className="cursor-pointer">
              <img src={journalist} width={60} height={60} className="rounded-full" />
            </div>
            <div className="ml-6 mr-auto">
              <h3 className="text-lg">{messages?.receiver?.fullName}</h3>
              <p className="text-sm font-light text-gray-600">{messages?.receiver?.email}</p>
            </div>
          </div>
        )}

        <div className="h-[75%] w-full overflow-scroll shadow-sm">
          <div className="p-14">
            {messages?.messages?.length > 0 ? (
              messages.messages.map(({ message, user: { id } = {} }, index) => (
                <div
                  className={`max-w-[40%] rounded-b-xl p-4 mb-6 ${
                    id === user?.id
                      ? 'bg-primary text-white rounded-tl-xl ml-auto'
                      : 'bg-primary text-white rounded-tl-xl ml-auto'
                  }`}
                  key={index}
                >
                  {message}
                </div>
              ))
            ) : (
              <div className="text-center text-lg font-semibold mt-24">
                No Messages or No Conversation Selected
              </div>
            )}
          </div>
        </div>

        {messages?.receiver?.fullName && (
          <div className="p-14 w-full flex items-center">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-[75%]"
              inputClassName="p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 outline-none"
            />
            <div
              className={`ml-4 p-2 cursor-pointer bg-light rounded-full ${!message && 'pointer-events-none'}`}
              onClick={sendMessage}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-send"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="#2c3e50"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <line x1="10" y1="14" x2="21" y2="3" />
                <path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="w-[25%] h-screen bg-light px-8 py-16 overflow-scroll">
        <div className="text-primary text-lg">People</div>
        <div>
          {users.length > 0 ? (
            users.map(({ userId, user }) => (
              <div
                className="flex items-center py-8 border-b border-b-gray-300"
                key={userId}
              >
                <div
                  className="cursor-pointer flex items-center"
                  onClick={() => fetchMessages('new', user)}
                >
                  <div>
                    <img
                      src={employee}
                      className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary"
                    />
                  </div>
                  <div className="ml-6">
                    <h3 className="text-lg font-semibold">{user?.fullName}</h3>
                    <p className="text-sm font-light text-gray-600">{user?.email}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-lg font-semibold mt-24">
              No Users Available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;