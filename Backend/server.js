// Smart Library Backend API Server
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const borrowingRoutes = require('./routes/borrowing');
const analyticsRoutes = require('./routes/analytics');
const statisticsRoutes = require('./routes/statistics');
const logsRoutes = require('./routes/logs');
const systemRoutes = require('./routes/system');
const profileRoutes = require('./routes/profile');
const uploadRoutes = require('./routes/upload');
const sessionsRoutes = require('./routes/sessions');
const sessionManager = require('./routes/sessions');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Make io available to routes
app.set('io', io);

/* =========================
   SECURITY MIDDLEWARE
========================= */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "blob:", "https:"],
      },
    },
  })
);

/* =========================
   CORS (GLOBAL SAFE)
========================= */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  })
);

/* =========================
   RATE LIMITING
========================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 1000,
  message: {
    error: 'Too many requests',
    message: 'Please try again later.',
  },
});
app.use('/api/', limiter);

/* =========================
   BODY PARSERS
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC UPLOADS
========================= */
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

/* =========================
   SOCKET.IO REAL-TIME
========================= */
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Authenticate socket connection
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.id;
      socket.userRole = decoded.role;

      // Add to active sessions
      sessionManager.addSession(decoded.id, socket.id, {
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        department: decoded.department,
        studentId: decoded.studentId
      });

      socket.emit('authenticated', { success: true });

      // Broadcast updated active users count
      io.emit('activeUsers:updated', {
        total: sessionManager.activeSessions.size
      });

      console.log(`✅ User authenticated: ${decoded.name} (${decoded.role})`);
    } catch (error) {
      console.error('Socket auth error:', error);
      socket.emit('authenticated', { success: false, error: 'Invalid token' });
    }
  });

  // Handle activity updates
  socket.on('activity', () => {
    sessionManager.updateActivity(socket.id);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    sessionManager.removeSession(socket.id);

    // Broadcast updated active users count
    io.emit('activeUsers:updated', {
      total: sessionManager.activeSessions.size
    });
  });
});

/* =========================
   HEALTH CHECK
========================= */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Library API is running',
    timestamp: new Date().toISOString(),
    activeConnections: io.engine.clientsCount
  });
});

/* =========================
   DEBUG UPLOADS
========================= */
app.get('/api/debug/uploads', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads', 'profiles');

  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        exists: false,
        path: uploadsDir,
      });
    }

    const files = fs.readdirSync(uploadsDir).map(file => {
      const stats = fs.statSync(path.join(uploadsDir, file));
      return {
        name: file,
        size: stats.size,
        url: `/uploads/profiles/${file}`,
        fullUrl: `${req.protocol}://${req.get('host')}/uploads/profiles/${file}`,
      };
    });

    res.json({
      exists: true,
      fileCount: files.length,
      files,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   API ROUTES
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrowing', borrowingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/sessions', sessionsRoutes);

/* =========================
   SERVE REACT (PRODUCTION)
========================= */
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/build');

  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  // Development 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.url} not found`,
    });
  });
}

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

/* =========================
   START SERVER
========================= */
server.listen(PORT, () => {
  console.log(`🚀 Smart Library running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket server ready`);
});

module.exports = { app, server, io };

