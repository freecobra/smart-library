// Rating API Routes - Free AI Feature
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/ratings/book/:id - Rate a book
router.post('/book/:id', authenticateToken, async (req, res) => {
    try {
        const { id: bookId } = req.params;
        const { rating, review } = req.body;
        const userId = req.user.id;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Upsert rating (update if exists, create if not)
        const bookRating = await prisma.bookRating.upsert({
            where: {
                userId_bookId: { userId, bookId }
            },
            update: {
                rating: parseInt(rating),
                review: review || null
            },
            create: {
                userId,
                bookId,
                rating: parseInt(rating),
                review: review || null
            }
        });

        // Log interaction
        await prisma.userInteraction.create({
            data: {
                userId,
                bookId,
                actionType: 'rate'
            }
        });

        res.json({ rating: bookRating });
    } catch (error) {
        console.error('Rating error:', error);
        res.status(500).json({ error: 'Failed to rate book' });
    }
});

// GET /api/ratings/book/:id - Get ratings for a book
router.get('/book/:id', async (req, res) => {
    try {
        const { id: bookId } = req.params;

        const ratings = await prisma.bookRating.findMany({
            where: { bookId },
            include: {
                user: {
                    select: { name: true, profilePicture: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate average
        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

        res.json({
            ratings,
            average: Math.round(avgRating * 10) / 10,
            count: ratings.length
        });
    } catch (error) {
        console.error('Get ratings error:', error);
        res.status(500).json({ error: 'Failed to fetch ratings' });
    }
});

// GET /api/ratings/user/my-ratings - Get current user's ratings
router.get('/user/my-ratings', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const ratings = await prisma.bookRating.findMany({
            where: { userId },
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        coverImage: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.json({ ratings });
    } catch (error) {
        console.error('Get user ratings error:', error);
        res.status(500).json({ error: 'Failed to fetch user ratings' });
    }
});

// POST /api/ratings/track-interaction - Track user interaction
router.post('/track-interaction', authenticateToken, async (req, res) => {
    try {
        const { bookId, actionType, metadata } = req.body;
        const userId = req.user.id;

        await prisma.userInteraction.create({
            data: {
                userId,
                bookId,
                actionType, // 'view', 'borrow', 'download', 'search'
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Track interaction error:', error);
        res.status(500).json({ error: 'Failed to track interaction' });
    }
});

module.exports = router;
