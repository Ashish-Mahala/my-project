// server.js — Main Entry Point (Unit I, II, III - Node.js Syllabus)
// Covers: Node.js, Express, EventEmitter, Socket.IO, Middleware, JWT, MongoDB

require('dotenv').config();
const express = require('express');
const http = require('http');            // Node.js core HTTP module
const { Server } = require('socket.io'); // Socket.IO for real-time scoreboard
const cors = require('cors');
const path = require('path');
const zlib = require('zlib');            // Node.js core Zlib for compression
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Initialize Express ───────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app); // Wrap Express in Node HTTP server

// ─── Socket.IO Real-Time Scoreboard ──────────────────────────────────────────
// Unit III: Socket Services in Node.js
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Store active quiz sessions in memory (could be Redis in production)
const activeSessions = new Map();

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins a quiz room
  socket.on('join_quiz', ({ quizId, username }) => {
    socket.join(`quiz_${quizId}`);
    activeSessions.set(socket.id, { quizId, username });
    io.to(`quiz_${quizId}`).emit('user_joined', { username, count: io.sockets.adapter.rooms.get(`quiz_${quizId}`)?.size || 1 });
  });

  // Broadcast new score to quiz room (live leaderboard update)
  socket.on('submit_score', (scoreData) => {
    const { quizId } = scoreData;
    io.to(`quiz_${quizId}`).emit('score_update', scoreData);    // Emit to all in quiz room
    io.emit('global_score_update', scoreData);                  // Emit to everyone (global leaderboard)
  });

  // Sending and receiving messages (Unit III - Socket chat)
  socket.on('quiz_message', ({ quizId, username, text }) => {
    io.to(`quiz_${quizId}`).emit('quiz_message', { username, text, time: new Date().toISOString() });
  });

  socket.on('disconnect', () => {
    const session = activeSessions.get(socket.id);
    if (session) {
      io.to(`quiz_${session.quizId}`).emit('user_left', { username: session.username });
      activeSessions.delete(socket.id);
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

// ─── Core Middleware ──────────────────────────────────────────────────────────
// Unit III: Creating middlewares — cookie-parser, express-session concepts
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security headers middleware (Unit III: Authentication and Security)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Gzip compression using Node.js Zlib (Unit I: Compressing/Decompressing with Zlib)
app.use((req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (!acceptEncoding.includes('gzip')) return next();

  const originalSend = res.json.bind(res);
  res.json = (data) => {
    const json = JSON.stringify(data);
    zlib.gzip(json, (err, compressed) => {
      if (err) return originalSend(data);
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Type', 'application/json');
      res.send(compressed);
    });
  };
  next();
});

// ─── Serve Static Frontend ────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ───────────────────────────────────────────────────────────────
// Unit II: Implementing HTTP Services — GET, POST, Router, Error Handling
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/scores', require('./routes/scores'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'QuizForge API is running', timestamp: new Date() });
});

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   QuizForge Server Running             ║
  ║   http://localhost:${PORT}               ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}          ║
  ╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections (Node.js best practice)
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
