// File Upload Route for Books
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../uploads/books');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = file.fieldname + '-' + uniqueSuffix + ext;
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images and PDFs
    if (file.fieldname === 'coverImage') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Cover image must be an image file'), false);
        }
    } else if (file.fieldname === 'digitalFile') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Digital file must be a PDF'), false);
        }
    } else {
        cb(null, true);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// POST /api/upload/book - Upload a new book with files
router.post('/book',
    authenticateToken,
    checkRole('ADMIN', 'LIBRARIAN'),
    upload.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'digitalFile', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const {
                title,
                author,
                isbn,
                category,
                description,
                publicationYear,
                quantity
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

            // Get uploaded file paths
            const coverImagePath = req.files?.coverImage?.[0]
                ? `/uploads/books/${req.files.coverImage[0].filename}`
                : null;

            const digitalFilePath = req.files?.digitalFile?.[0]
                ? `/uploads/books/${req.files.digitalFile[0].filename}`
                : null;

            // Create book
            const newBook = await prisma.book.create({
                data: {
                    title,
                    author,
                    isbn: isbn || null,
                    category,
                    description: description || null,
                    publicationYear: publicationYear ? parseInt(publicationYear) : null,
                    quantity: quantity ? parseInt(quantity) : 1,
                    availableQuantity: quantity ? parseInt(quantity) : 1,
                    coverImage: coverImagePath,
                    digitalUrl: digitalFilePath
                }
            });

            // Log action
            await prisma.systemLog.create({
                data: {
                    userId: req.user.id,
                    action: 'BOOK_UPLOADED',
                    details: `${req.user.role} uploaded book: ${newBook.title} by ${newBook.author}`
                }
            });

            // Emit socket event for real-time update
            const io = req.app.get('io');
            if (io) {
                io.emit('book:added', {
                    book: newBook,
                    addedBy: {
                        id: req.user.id,
                        name: req.user.name,
                        role: req.user.role
                    }
                });
            }

            res.status(201).json({
                message: 'Book uploaded successfully',
                book: newBook
            });
        } catch (error) {
            console.error('Upload book error:', error);

            // Clean up uploaded files on error
            if (req.files?.coverImage?.[0]) {
                fs.unlinkSync(path.join(uploadsDir, req.files.coverImage[0].filename));
            }
            if (req.files?.digitalFile?.[0]) {
                fs.unlinkSync(path.join(uploadsDir, req.files.digitalFile[0].filename));
            }

            res.status(500).json({ error: 'Failed to upload book.' });
        }
    }
);

// DELETE /api/upload/book/:id - Delete book and its files
router.delete('/book/:id',
    authenticateToken,
    checkRole('ADMIN', 'LIBRARIAN'),
    async (req, res) => {
        try {
            const book = await prisma.book.findUnique({
                where: { id: req.params.id }
            });

            if (!book) {
                return res.status(404).json({ error: 'Book not found.' });
            }

            // Soft delete the book
            const deletedBook = await prisma.book.update({
                where: { id: req.params.id },
                data: { isActive: false }
            });

            // Optionally delete physical files
            // (commented out to preserve files, uncomment if you want hard delete)
            /*
            if (book.coverImage) {
              const coverPath = path.join(__dirname, '..', book.coverImage);
              if (fs.existsSync(coverPath)) {
                fs.unlinkSync(coverPath);
              }
            }
            if (book.digitalUrl) {
              const digitalPath = path.join(__dirname, '..', book.digitalUrl);
              if (fs.existsSync(digitalPath)) {
                fs.unlinkSync(digitalPath);
              }
            }
            */

            // Log action
            await prisma.systemLog.create({
                data: {
                    userId: req.user.id,
                    action: 'BOOK_DELETED',
                    details: `${req.user.role} deleted book: ${deletedBook.title}`
                }
            });

            // Emit socket event
            const io = req.app.get('io');
            if (io) {
                io.emit('book:deleted', {
                    bookId: deletedBook.id,
                    deletedBy: {
                        id: req.user.id,
                        name: req.user.name,
                        role: req.user.role
                    }
                });
            }

            res.json({
                message: 'Book deleted successfully',
                book: deletedBook
            });
        } catch (error) {
            console.error('Delete book error:', error);
            res.status(500).json({ error: 'Failed to delete book.' });
        }
    }
);

module.exports = router;
