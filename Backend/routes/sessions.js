// Active Session Management with Socket.IO
const express = require('express');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Store active sessions (in production, use Redis)
const activeSessions = new Map();

// Initialize socket.io instance (will be set by server.js)
let io = null;

const setIO = (socketIO) => {
  io = socketIO;
};

// Track user session
const addSession = (userId, socketId, userInfo) => {
  activeSessions.set(socketId, {
    userId,
    ...userInfo,
    connectedAt: new Date(),
    lastActivity: new Date()
  });
};

// Remove user session
const removeSession = (socketId) => {
  activeSessions.delete(socketId);
};

// Update last activity
const updateActivity = (socketId) => {
  const session = activeSessions.get(socketId);
  if (session) {
    session.lastActivity = new Date();
  }
};

// Get all active sessions
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const sessions = Array.from(activeSessions.values());
    
    res.json({
      total: sessions.length,
      sessions: sessions.map(s => ({
        userId: s.userId,
        name: s.name,
        role: s.role,
        email: s.email,
        connectedAt: s.connectedAt,
        lastActivity: s.lastActivity
      }))
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get active students only
router.get('/active-students', authenticateToken, checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
  try {
    const sessions = Array.from(activeSessions.values());
    const students = sessions.filter(s => s.role === 'STUDENT');
    
    res.json({
      total: students.length,
      students: students.map(s => ({
        userId: s.userId,
        name: s.name,
        email: s.email,
        department: s.department,
        studentId: s.studentId,
        connectedAt: s.connectedAt,
        lastActivity: s.lastActivity
      }))
    });
  } catch (error) {
    console.error('Get active students error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get active users by role
router.get('/active-by-role', authenticateToken, checkRole('ADMIN'), async (req, res) => {
  try {
    const sessions = Array.from(activeSessions.values());
    
    const byRole = sessions.reduce((acc, session) => {
      const role = session.role || 'UNKNOWN';
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push({
        userId: session.userId,
        name: session.name,
        email: session.email,
        connectedAt: session.connectedAt,
        lastActivity: session.lastActivity
      });
      return acc;
    }, {});
    
    res.json({
      total: sessions.length,
      byRole,
      summary: {
        students: (byRole.STUDENT || []).length,
        librarians: (byRole.LIBRARIAN || []).length,
        admins: (byRole.ADMIN || []).length
      }
    });
  } catch (error) {
    console.error('Get active by role error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
module.exports.setIO = setIO;
module.exports.addSession = addSession;
module.exports.removeSession = removeSession;
module.exports.updateActivity = updateActivity;
module.exports.activeSessions = activeSessions;
