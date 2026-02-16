// Recommendation API Routes - Free AI
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const recommendationEngine = require('../services/recommendationEngine');

const router = express.Router();

// GET /api/recommendations/personalized - Get personalized recommendations
router.get('/personalized', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;

        const recommendations = await recommendationEngine.getPersonalizedRecommendations(userId, limit);

        res.json({ recommendations });
    } catch (error) {
        console.error('Personalized recommendations error:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

// GET /api/recommendations/similar/:bookId - Get similar books
router.get('/similar/:bookId', async (req, res) => {
    try {
        const { bookId } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const recommendations = await recommendationEngine.getSimilarBooks(bookId, limit);

        res.json({ recommendations });
    } catch (error) {
        console.error('Similar books error:', error);
        res.status(500).json({ error: 'Failed to get similar books' });
    }
});

// GET /api/recommendations/trending - Get trending books
router.get('/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const recommendations = await recommendationEngine.getTrendingBooks(limit);

        res.json({ recommendations });
    } catch (error) {
        console.error('Trending books error:', error);
        res.status(500).json({ error: 'Failed to get trending books' });
    }
});

// GET /api/recommendations/collaborative - Get collaborative filtering recommendations
router.get('/collaborative', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;

        const recommendations = await recommendationEngine.getCollaborativeRecommendations(userId, limit);

        res.json({ recommendations });
    } catch (error) {
        console.error('Collaborative recommendations error:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

module.exports = router;
