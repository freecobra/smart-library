// Authentication Routes
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({ error: 'Account is inactive. Please contact administrator.' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Generate token
        const token = generateToken(user.id);

        // Log login activity
        await prisma.systemLog.create({
            data: {
                userId: user.id,
                action: 'USER_LOGIN',
                details: `User logged in: ${user.email}`
            }
        });

        // Return user data and token (exclude password)
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/auth/register - Register new user (Admin only in production)
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role, department, studentId } = req.body;

        // Validation
        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Email, password, name, and role are required.' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                role,
                department,
                studentId
            }
        });

        // Log registration
        await prisma.systemLog.create({
            data: {
                userId: newUser.id,
                action: 'USER_REGISTERED',
                details: `New user registered: ${newUser.email} (${newUser.role})`
            }
        });

        // Generate token
        const token = generateToken(newUser.id);

        // Return user data (exclude password)
        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                department: true,
                studentId: true,
                profilePicture: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/auth/logout - Logout (for logging purposes)
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        // Log logout activity
        await prisma.systemLog.create({
            data: {
                userId: req.user.id,
                action: 'USER_LOGOUT',
                details: `User logged out: ${req.user.email}`
            }
        });

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
