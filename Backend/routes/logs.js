// System Logs Routes
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All log routes require admin authentication
router.use(authenticateToken);
router.use(checkRole('ADMIN'));

// GET /api/logs - Retrieve system logs
router.get('/', async (req, res) => {
    try {
        const { action, userId, startDate, endDate, page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (action) where.action = { contains: action };
        if (userId) where.userId = userId;
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) where.timestamp.gte = new Date(startDate);
            if (endDate) where.timestamp.lte = new Date(endDate);
        }

        const [logs, total] = await Promise.all([
            prisma.systemLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            role: true
                        }
                    }
                },
                skip,
                take: parseInt(limit),
                orderBy: { timestamp: 'desc' }
            }),
            prisma.systemLog.count({ where })
        ]);

        res.json({
            logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/logs - Create log entry (for internal use or manual logging)
router.post('/', async (req, res) => {
    try {
        const { action, details, userId } = req.body;

        if (!action) {
            return res.status(400).json({ error: 'Action is required.' });
        }

        const log = await prisma.systemLog.create({
            data: {
                action,
                details,
                userId: userId || req.user.id
            }
        });

        res.status(201).json({ log });
    } catch (error) {
        console.error('Create log error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
