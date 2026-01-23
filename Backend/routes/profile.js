// Profile Management Routes
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/profiles');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
    }
});

// GET /api/profile - Get current user's profile
router.get('/', authenticateToken, async (req, res) => {
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
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/profile - Update user profile
router.put('/', authenticateToken, async (req, res) => {
    try {
        const { name, department } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(name && { name }),
                ...(department && { department })
            },
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

        // Log activity
        await prisma.systemLog.create({
            data: {
                userId: req.user.id,
                action: 'PROFILE_UPDATED',
                details: `User updated their profile`
            }
        });

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// POST /api/profile/upload-picture - Upload profile picture
router.post('/upload-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get old profile picture
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { profilePicture: true }
        });

        // Delete old profile picture if it exists
        if (user.profilePicture) {
            const oldPath = path.join(__dirname, '..', user.profilePicture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save new profile picture path
        const profilePicturePath = `/uploads/profiles/${req.file.filename}`;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { profilePicture: profilePicturePath },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                department: true,
                studentId: true,
                profilePicture: true,
                isActive: true
            }
        });

        // Log activity
        await prisma.systemLog.create({
            data: {
                userId: req.user.id,
                action: 'PROFILE_PICTURE_UPDATED',
                details: `User uploaded a new profile picture`
            }
        });

        res.json({
            message: 'Profile picture uploaded successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Upload picture error:', error);
        res.status(500).json({ error: 'Failed to upload profile picture' });
    }
});

// DELETE /api/profile/picture - Delete profile picture
router.delete('/picture', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { profilePicture: true }
        });

        if (user.profilePicture) {
            const filePath = path.join(__dirname, '..', user.profilePicture);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { profilePicture: null },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                department: true,
                studentId: true,
                profilePicture: true,
                isActive: true
            }
        });

        res.json({
            message: 'Profile picture deleted successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Delete picture error:', error);
        res.status(500).json({ error: 'Failed to delete profile picture' });
    }
});

module.exports = router;
