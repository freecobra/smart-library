const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');

// Get system settings
router.get('/settings', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        let settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            // Create default settings if none exist
            settings = await prisma.systemSettings.create({
                data: {
                    libraryName: 'SmartLibrary',
                    maxBorrowDuration: 14,
                    maxBooksPerUser: 5,
                    fineAmountPerDay: 0.50
                }
            });
        }

        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update system settings
router.put('/settings', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { libraryName, maxBorrowDuration, maxBooksPerUser, fineAmountPerDay } = req.body;

        let settings = await prisma.systemSettings.findFirst();

        if (settings) {
            settings = await prisma.systemSettings.update({
                where: { id: settings.id },
                data: {
                    libraryName,
                    maxBorrowDuration: parseInt(maxBorrowDuration),
                    maxBooksPerUser: parseInt(maxBooksPerUser),
                    fineAmountPerDay: parseFloat(fineAmountPerDay)
                }
            });
        } else {
            settings = await prisma.systemSettings.create({
                data: {
                    libraryName,
                    maxBorrowDuration: parseInt(maxBorrowDuration),
                    maxBooksPerUser: parseInt(maxBooksPerUser),
                    fineAmountPerDay: parseFloat(fineAmountPerDay)
                }
            });
        }

        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// System Maintenance Actions
router.post('/maintenance/:action', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { action } = req.params;

        switch (action) {
            case 'backup':
                // Mock backup
                await new Promise(resolve => setTimeout(resolve, 2000));
                res.json({ message: 'Database backup completed successfully' });
                break;
            case 'clear-cache':
                // Mock cache clear
                res.json({ message: 'System cache cleared successfully' });
                break;
            case 'maintenance-mode':
                // Toggle maintenance mode (could be stored in settings)
                res.json({ message: 'Maintenance mode toggled' });
                break;
            default:
                res.status(400).json({ message: 'Invalid action' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get System Health Stats
router.get('/health-stats', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Mock health data (in a real app, this would check actual DB connection, disk space, etc.)
        const healthData = {
            database: {
                status: 'Operational',
                uptime: process.uptime(),
                latency: Math.floor(Math.random() * 20) + 10 // Mock latency 10-30ms
            },
            api: {
                responseTime: Math.floor(Math.random() * 50) + 20, // Mock response time 20-70ms
                status: 'Excellent'
            },
            storage: {
                used: 67, // Mock percentage
                total: '1TB',
                free: '330GB'
            }
        };

        res.json(healthData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
