const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const rateLimiter = require('./middleware/rateLimiter');


// Load environment variables
dotenv.config();

// Passport Config - Pass passport instance to the config
require('./config/passport');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);
app.use(session({
    secret: process.env.SESSION_SECRET || 'averysecretkey',
    resave: false,
    saveUninitialized: false, // Set to false, login will init session
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected with socket id:', socket.id);

  // Join a room based on user ID from the client
  socket.on('join', (userId) => {
    if (userId) {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined room for user ${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected with socket id:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes(io)); // Pass io instance to todo routes


// Simple route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Connect to MongoDB
// Make sure to have your MONGO_URI in the .env file
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));