const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const config = require('./config/config');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: config.socket.corsOrigin,
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true
}));
app.use(express.json());

mongoose.connect(config.database.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_connected', (userId) => {
    connectedUsers.set(userId, socket.id);
    io.emit('users_online', Array.from(connectedUsers.keys()));
  });

  socket.on('send_message', async (data) => {
    const recipientSocketId = connectedUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_message', data);
    }
  });

  socket.on('disconnect', () => {
    let disconnectedUserId;
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    if (disconnectedUserId) {
      connectedUsers.delete(disconnectedUserId);
      io.emit('users_online', Array.from(connectedUsers.keys()));
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

server.listen(config.server.port, () => {
  console.log(`Server running in ${config.server.nodeEnv} mode on port ${config.server.port}`);
});