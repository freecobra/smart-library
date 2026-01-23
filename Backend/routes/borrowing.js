// Borrowing System Routes
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// POST /api/borrowing/borrow - Request to borrow a book
router.post('/borrow', async (req, res) => {
    try {
        const { bookId, dueDate } = req.body;

        if (!bookId || !dueDate) {
            return res.status(400).json({ error: 'Book ID and due date are required.' });
        }

        // Check if book exists and is available
        const book = await prisma.book.findUnique({
            where: { id: bookId }
        });

        if (!book || !book.isActive) {
            return res.status(404).json({ error: 'Book not found.' });
        }

        if (book.availableQuantity <= 0) {
            return res.status(400).json({ error: 'Book is currently unavailable.' });
        }

        // Check if user already has this book borrowed or requested
        const existingBorrow = await prisma.borrowRecord.findFirst({
            where: {
                userId: req.user.id,
                bookId,
                status: { in: ['BORROWED', 'PENDING'] }
            }
        });

        if (existingBorrow) {
            return res.status(400).json({ error: 'You have already borrowed or requested this book.' });
        }

        // Create borrow record and update book quantity in a transaction
        const borrowRecord = await prisma.$transaction(async (tx) => {
            // Create borrow record with PENDING status
            const record = await tx.borrowRecord.create({
                data: {
                    userId: req.user.id,
                    bookId,
                    dueDate: new Date(dueDate),
                    status: 'PENDING'
                },
                include: {
                    book: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            // Decrease available quantity (reserve the book)
            await tx.book.update({
                where: { id: bookId },
                data: { availableQuantity: { decrement: 1 } }
            });

            return record;
        });

        // Log action
        await prisma.systemLog.create({
            data: {
                userId: req.user.id,
                action: 'BORROW_REQUESTED',
                details: `User requested: ${book.title}`
            }
        });

        res.status(201).json({ borrowRecord });
    } catch (error) {
        console.error('Borrow request error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/borrowing/request/:id - Approve or Reject borrow request
router.put('/request/:id', checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
        const { status } = req.body; // 'BORROWED' (Approve) or 'REJECTED' (Reject)
        const { id } = req.params;

        if (!['BORROWED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Use BORROWED to approve or REJECTED to reject.' });
        }

        const borrowRecord = await prisma.borrowRecord.findUnique({
            where: { id },
            include: { book: true }
        });

        if (!borrowRecord) {
            return res.status(404).json({ error: 'Request not found.' });
        }

        if (borrowRecord.status !== 'PENDING') {
            return res.status(400).json({ error: 'Request is not pending.' });
        }

        const updatedRecord = await prisma.$transaction(async (tx) => {
            // Update record status
            const record = await tx.borrowRecord.update({
                where: { id },
                data: { status },
                include: {
                    book: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            // If rejected, return the book to inventory
            if (status === 'REJECTED') {
                await tx.book.update({
                    where: { id: borrowRecord.bookId },
                    data: { availableQuantity: { increment: 1 } }
                });
            }

            return record;
        });

        // Log action
        await prisma.systemLog.create({
            data: {
                userId: req.user.id,
                action: status === 'BORROWED' ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
                details: `${status === 'BORROWED' ? 'Approved' : 'Rejected'} request for: ${borrowRecord.book.title}`
            }
        });

        res.json({ borrowRecord: updatedRecord });

    } catch (error) {
        console.error('Process request error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/borrowing/return/:recordId - Return a borrowed book
router.post('/return/:recordId', async (req, res) => {
    try {
        const { recordId } = req.params;

        // Find borrow record
        const borrowRecord = await prisma.borrowRecord.findUnique({
            where: { id: recordId },
            include: { book: true }
        });

        if (!borrowRecord) {
            return res.status(404).json({ error: 'Borrow record not found.' });
        }

        // Check if user owns this record or is admin/librarian
        if (borrowRecord.userId !== req.user.id &&
            !['ADMIN', 'LIBRARIAN'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        if (borrowRecord.status === 'RETURNED') {
            return res.status(400).json({ error: 'Book has already been returned.' });
        }

        // Calculate if overdue and fine
        const now = new Date();
        const isOverdue = now > borrowRecord.dueDate;
        const daysOverdue = isOverdue
            ? Math.ceil((now - borrowRecord.dueDate) / (1000 * 60 * 60 * 24))
            : 0;
        const fineAmount = daysOverdue * 0.5; // $0.50 per day

        // Update record and book quantity in a transaction
        const updatedRecord = await prisma.$transaction(async (tx) => {
            // Update borrow record
            const record = await tx.borrowRecord.update({
                where: { id: recordId },
                data: {
                    returnDate: now,
                    status: 'RETURNED',
                    fineAmount: fineAmount
                },
                include: {
                    book: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            // Increase available quantity
            await tx.book.update({
                where: { id: borrowRecord.bookId },
                data: { availableQuantity: { increment: 1 } }
            });

            return record;
        });

        // Log action
        await prisma.systemLog.create({
            data: {
                userId: req.user.id,
                action: 'BOOK_RETURNED',
                details: `Book returned: ${borrowRecord.book.title}${isOverdue ? ` (${daysOverdue} days overdue, fine: $${fineAmount.toFixed(2)})` : ''}`
            }
        });

        res.json({ borrowRecord: updatedRecord, isOverdue, daysOverdue, fineAmount });
    } catch (error) {
        console.error('Return book error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/borrowing/my-books - Get current user's borrowing history
router.get('/my-books', async (req, res) => {
    try {
        const { status } = req.query;

        const where = { userId: req.user.id };
        if (status) where.status = status;

        const borrowRecords = await prisma.borrowRecord.findMany({
            where,
            include: {
                book: true
            },
            orderBy: { borrowDate: 'desc' }
        });

        res.json({ borrowRecords });
    } catch (error) {
        console.error('Get my books error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/borrowing/all - Get all borrowing records (Admin/Librarian only)
router.get('/all', checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
        const { status, userId, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (userId) where.userId = userId;

        const [borrowRecords, total] = await Promise.all([
            prisma.borrowRecord.findMany({
                where,
                include: {
                    book: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            studentId: true
                        }
                    }
                },
                skip,
                take: parseInt(limit),
                orderBy: { borrowDate: 'desc' }
            }),
            prisma.borrowRecord.count({ where })
        ]);

        res.json({
            borrowRecords,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get all borrows error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/borrowing/overdue - Get overdue books (Admin/Librarian only)
router.get('/overdue', checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
        const now = new Date();

        const overdueRecords = await prisma.borrowRecord.findMany({
            where: {
                status: 'BORROWED',
                dueDate: { lt: now }
            },
            include: {
                book: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        studentId: true
                    }
                }
            },
            orderBy: { dueDate: 'asc' }
        });

        res.json({ overdueRecords });
    } catch (error) {
        console.error('Get overdue error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/borrowing/fine/:recordId - Update fine amount (Admin/Librarian only)
router.put('/fine/:recordId', checkRole('ADMIN', 'LIBRARIAN'), async (req, res) => {
    try {
        const { fineAmount } = req.body;

        if (fineAmount === undefined) {
            return res.status(400).json({ error: 'Fine amount is required.' });
        }

        const updatedRecord = await prisma.borrowRecord.update({
            where: { id: req.params.recordId },
            data: { fineAmount: parseFloat(fineAmount) },
            include: {
                book: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Log action
        await prisma.systemLog.create({
            data: {
                userId: req.user.id,
                action: 'FINE_UPDATED',
                details: `${req.user.role} updated fine for borrow record ${req.params.recordId} to $${fineAmount}`
            }
        });

        res.json({ borrowRecord: updatedRecord });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Borrow record not found.' });
        }
        console.error('Update fine error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
