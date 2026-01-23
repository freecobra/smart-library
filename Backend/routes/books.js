// Book Management Routes
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/books - Get all books (Public with auth)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { category, search, available, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = { isActive: true };
        if (category) where.category = category;
        if (available === 'true') {
            where.availableQuantity = { gt: 0 };
        }
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { author: { contains: search } },
                { isbn: { contains: search } }
            ];
        }

        const [books, total] = await Promise.all([
            prisma.book.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.book.count({ where })
        ]);

        res.json({
            books,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/books/stats - Get book statistics
router.get('/stats', authenticateToken, checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
        const [totalBooks, availableBooks, categoriesData, digitalResources] = await Promise.all([
            prisma.book.count({ where: { isActive: true } }),
            prisma.book.aggregate({
                where: { isActive: true },
                _sum: { availableQuantity: true }
            }),
            prisma.book.groupBy({
                by: ['category'],
                _count: true,
                where: { isActive: true }
            }),
            prisma.book.count({
                where: { isActive: true, digitalUrl: { not: null } }
            })
        ]);

        const categoryStats = categoriesData.reduce((acc, item) => {
            acc[item.category] = item._count;
            return acc;
        }, {});

        res.json({
            totalBooks,
            availableBooks: availableBooks._sum.availableQuantity || 0,
            digitalResources,
            byCategory: categoryStats
        });
    } catch (error) {
        console.error('Get book stats error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/books/categories - Get all categories
router.get('/categories', authenticateToken, async (req, res) => {
    try {
        const categories = await prisma.book.findMany({
            where: { isActive: true },
            select: { category: true },
            distinct: ['category']
        });

        res.json({ categories: categories.map(c => c.category) });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/books/:id - Get specific book
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: req.params.id },
            include: {
                _count: {
                    select: {
                        borrowRecords: true
                    }
                }
            }
        });

        if (!book || !book.isActive) {
            return res.status(404).json({ error: 'Book not found.' });
        }

        res.json({ book });
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/books - Add new book (Admin/Librarian only)
router.post('/', authenticateToken, checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
        const {
            title,
            author,
            isbn,
            category,
            description,
            publicationYear,
            quantity,
            digitalUrl,
            coverImage
        } = req.body;

        // Validation
        if (!title || !author || !category) {
            return res.status(400).json({ error: 'Title, author, and category are required.' });
        }

        // Check if ISBN already exists
        if (isbn) {
            const existingBook = await prisma.book.findUnique({
                where: { isbn }
            });
            if (existingBook) {
                return res.status(409).json({ error: 'Book with this ISBN already exists.' });
            }
        }

        const newBook = await prisma.book.create({
            data: {
                title,
                author,
                isbn,
                category,
                description,
                publicationYear: publicationYear ? parseInt(publicationYear) : null,
                quantity: quantity ? parseInt(quantity) : 1,
                availableQuantity: quantity ? parseInt(quantity) : 1,
                digitalUrl,
                coverImage
            }
        });

        // Log action
        await prisma.systemLog.create({
            data: {
                userId: req.user.id,
                action: 'BOOK_ADDED',
                details: `${req.user.role} added book: ${newBook.title} by ${newBook.author}`
            }
        });

        res.status(201).json({ book: newBook });
    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/books/:id - Update book (Admin/Librarian only)
router.put('/:id', authenticateToken, checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
        const {
            title,
            author,
            category,
            description,
            publicationYear,
            quantity,
            availableQuantity,
            digitalUrl,
            coverImage
        } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (author) updateData.author = author;
        if (category) updateData.category = category;
        if (description !== undefined) updateData.description = description;
        if (publicationYear) updateData.publicationYear = parseInt(publicationYear);
        if (quantity !== undefined) updateData.quantity = parseInt(quantity);
        if (availableQuantity !== undefined) updateData.availableQuantity = parseInt(availableQuantity);
        if (digitalUrl !== undefined) updateData.digitalUrl = digitalUrl;
        if (coverImage !== undefined) updateData.coverImage = coverImage;

        const updatedBook = await prisma.book.update({
            where: { id: req.params.id },
            data: updateData
        });

        // Log action
        await prisma.systemLog.create({
            data: {
                userId: req.user.id,
                action: 'BOOK_UPDATED',
                details: `${req.user.role} updated book: ${updatedBook.title}`
            }
        });

        res.json({ book: updatedBook });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Book not found.' });
        }
        console.error('Update book error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// DELETE /api/books/:id - Delete book (Admin only)
router.delete('/:id', authenticateToken, checkRole('ADMIN'), async (req, res) => {
    try {
        // Soft delete
        const deletedBook = await prisma.book.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });

        // Log action
        await prisma.systemLog.create({
            data: {
                userId: req.user.id,
                action: 'BOOK_DELETED',
                details: `Admin deleted book: ${deletedBook.title}`
            }
        });

        res.json({ message: 'Book deleted successfully', book: deletedBook });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Book not found.' });
        }
        console.error('Delete book error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
