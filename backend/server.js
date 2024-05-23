const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Adjust this to match your frontend's URL
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('sendMessage', (message) => {
    console.log("Is this it?");
    io.emit('receiveMessages', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = 4000
const MONGO_URI = 'mongodb://127.0.0.1:27017/chat-app';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((error) => console.log(error.message));

module.exports = io;