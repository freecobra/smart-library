// Smart Library Backend API Server
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

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

const app = express();
const PORT = process.env.PORT || 5000;

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
   HEALTH CHECK
========================= */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Library API is running',
    timestamp: new Date().toISOString(),
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
app.listen(PORT, () => {
  console.log(`🚀 Smart Library running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
