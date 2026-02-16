// Simple Recommendation Engine - 100% Free, No APIs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class FreeRecommendationEngine {
    /**
     * Get personalized recommendations based on user's rating history
     * Algorithm: Collaborative Filtering + Content-Based
     */
    async getPersonalizedRecommendations(userId, limit = 10) {
        try {
            // Get user's highly-rated books (4-5 stars)
            const userRatings = await prisma.bookRating.findMany({
                where: {
                    userId,
                    rating: { gte: 4 }
                },
                include: { book: true }
            });

            if (userRatings.length === 0) {
                // New user - return trending books
                return await this.getTrendingBooks(limit);
            }

            // Extract favorite categories and authors
            const favoriteCategories = [...new Set(userRatings.map(r => r.book.category))];
            const favoriteAuthors = [...new Set(userRatings.map(r => r.book.author))];
            const viewedBookIds = userRatings.map(r => r.bookId);

            // Find similar books
            const recommendations = await prisma.book.findMany({
                where: {
                    AND: [
                        { isActive: true },
                        { id: { notIn: viewedBookIds } },
                        {
                            OR: [
                                { category: { in: favoriteCategories } },
                                { author: { in: favoriteAuthors } }
                            ]
                        }
                    ]
                },
                include: {
                    ratings: {
                        select: { rating: true }
                    }
                },
                take: limit * 2 // Get more to rank
            });

            // Score and rank recommendations
            const scored = recommendations.map(book => {
                let score = 0;

                // Category match bonus
                if (favoriteCategories.includes(book.category)) score += 3;

                // Author match bonus
                if (favoriteAuthors.includes(book.author)) score += 2;

                // Average rating bonus
                const avgRating = book.ratings.length > 0
                    ? book.ratings.reduce((sum, r) => sum + r.rating, 0) / book.ratings.length
                    : 0;
                score += avgRating;

                return { book, score };
            });

            // Sort by score and return top N
            return scored
                .sort((a, b) => b.score - a.score)
                .slice(0, limit)
                .map(item => item.book);

        } catch (error) {
            console.error('Personalized recommendations error:', error);
            return [];
        }
    }

    /**
     * Get books similar to a given book
     * Based on category, author, and ratings
     */
    async getSimilarBooks(bookId, limit = 10) {
        try {
            const targetBook = await prisma.book.findUnique({
                where: { id: bookId }
            });

            if (!targetBook) return [];

            const similarBooks = await prisma.book.findMany({
                where: {
                    AND: [
                        { isActive: true },
                        { id: { not: bookId } },
                        {
                            OR: [
                                { category: targetBook.category },
                                { author: targetBook.author }
                            ]
                        }
                    ]
                },
                include: {
                    ratings: {
                        select: { rating: true }
                    }
                },
                take: limit
            });

            return similarBooks;
        } catch (error) {
            console.error('Similar books error:', error);
            return [];
        }
    }

    /**
     * Get trending books (most borrowed + highest rated recently)
     */
    async getTrendingBooks(limit = 10) {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Get books with recent activity
            const books = await prisma.book.findMany({
                where: { isActive: true },
                include: {
                    ratings: {
                        where: {
                            createdAt: { gte: thirtyDaysAgo }
                        }
                    },
                    borrowRecords: {
                        where: {
                            createdAt: { gte: thirtyDaysAgo }
                        }
                    }
                }
            });

            // Score based on ratings and borrows
            const scored = books.map(book => {
                const avgRating = book.ratings.length > 0
                    ? book.ratings.reduce((sum, r) => sum + r.rating, 0) / book.ratings.length
                    : 0;

                const borrowCount = book.borrowRecords.length;
                const ratingCount = book.ratings.length;

                // Trending score: average rating * (borrows + ratings)
                const score = avgRating * (borrowCount + ratingCount);

                return { book, score };
            });

            return scored
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit)
                .map(item => item.book);

        } catch (error) {
            console.error('Trending books error:', error);
            return [];
        }
    }

    /**
     * Get books user might like based on collaborative filtering
     * "Users who liked X also liked Y"
     */
    async getCollaborativeRecommendations(userId, limit = 10) {
        try {
            // Find users with similar tastes
            const userBooks = await prisma.bookRating.findMany({
                where: {
                    userId,
                    rating: { gte: 4 }
                },
                select: { bookId: true }
            });

            if (userBooks.length === 0) return [];

            const likedBookIds = userBooks.map(r => r.bookId);

            // Find other users who liked the same books
            const similarUsers = await prisma.bookRating.findMany({
                where: {
                    bookId: { in: likedBookIds },
                    rating: { gte: 4 },
                    userId: { not: userId }
                },
                select: { userId: true },
                distinct: ['userId']
            });

            const similarUserIds = similarUsers.map(u => u.userId);

            // Get books those users liked that current user hasn't rated
            const recommendations = await prisma.bookRating.findMany({
                where: {
                    userId: { in: similarUserIds },
                    rating: { gte: 4 },
                    bookId: { notIn: likedBookIds }
                },
                include: { book: true },
                orderBy: { rating: 'desc' },
                take: limit
            });

            return recommendations.map(r => r.book);

        } catch (error) {
            console.error('Collaborative recommendations error:', error);
            return [];
        }
    }
}

module.exports = new FreeRecommendationEngine();
