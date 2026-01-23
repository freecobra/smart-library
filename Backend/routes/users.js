// User Management Routes
const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All user routes require authentication
router.use(authenticateToken);

// GET /api/users - Get all users (Admin and Librarian)
router.get('/', checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {};
        if (role) where.role = role;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { department: { contains: search } }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    department: true,
                    studentId: true,
                    isActive: true,
                    createdAt: true
                },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/users/stats - Get user statistics (Admin and Librarian)
router.get('/stats', checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
        const [totalUsers, activeUsers, usersByRole] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isActive: true } }),
            prisma.user.groupBy({
                by: ['role'],
                _count: true
            })
        ]);

        const roleStats = usersByRole.reduce((acc, item) => {
            acc[item.role.toLowerCase()] = item._count;
            return acc;
        }, {});

        res.json({
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
            byRole: roleStats
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/users/:id - Get specific user (Admin and Librarian)
router.get('/:id', checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                department: true,
                studentId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        borrowRecords: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/users - Create new user (Admin and Librarian)
router.post('/', checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
        const { email, password, name, role, department, studentId } = req.body;

        // Validation
        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Email, password, name, and role are required.' });
        }

        // Check if user exists
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

        // Log action
        await prisma.systemLog.create({
            data: {
                userId: req.user.id,
                action: 'USER_CREATED',
                details: `Admin created user: ${newUser.email} (${newUser.role})`
            }
        });

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/users/:id - Update user (Admin and Librarian)
router.put('/:id', checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
        const { name, role, department, studentId, isActive } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (role) updateData.role = role;
        if (department !== undefined) updateData.department = department;
        if (studentId !== undefined) updateData.studentId = studentId;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                department: true,
                studentId: true,
                isActive: true,
                updatedAt: true
            }
        });

        // Log action
        await prisma.systemLog.create({
            data: {
                userId: req.user.id,
                action: 'USER_UPDATED',
                details: `Admin updated user: ${updatedUser.email}`
            }
        });

        res.json({ user: updatedUser });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found.' });
        }
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// DELETE /api/users/:id - Delete user (Admin and Librarian)
router.delete('/:id', checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
        // Soft delete by deactivating
        const deletedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: { isActive: false },
            select: {
                id: true,
                email: true,
                name: true
            }
        });

        // Log action
        await prisma.systemLog.create({
            data: {
                userId: req.user.id,
                action: 'USER_DELETED',
                details: `Admin deleted user: ${deletedUser.email}`
            }
        });

        res.json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found.' });
        }
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
