const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkBooks() {
    try {
        const books = await prisma.book.findMany();
        console.log(`\n📚 Total books in DB: ${books.length}`);

        if (books.length === 0) {
            console.log('❌ No books found in database. Please upload books via the dashboard.');
            return;
        }

        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            console.log(`❌ Uploads directory does not exist: ${uploadsDir}`);
        } else {
            console.log(`✅ Uploads directory exists: ${uploadsDir}`);
            const files = fs.readdirSync(uploadsDir);
            console.log(`   Files in uploads: ${files.length}`);
        }

        books.forEach(book => {
            console.log(`\n📖 Title: ${book.title}`);
            console.log(`   ID: ${book.id}`);
            console.log(`   Digital URL: ${book.digitalUrl}`);
            console.log(`   Cover Image: ${book.coverImage}`);

            if (book.digitalUrl) {
                // Handle both absolute URL and relative path
                let filePath;
                if (book.digitalUrl.startsWith('http')) {
                    console.log('   ℹ️ External URL (cannot verify file existence locally)');
                } else {
                    const cleanPath = book.digitalUrl.replace(/^\/uploads\//, '').replace(/\\/g, '/');
                    filePath = path.join(uploadsDir, cleanPath);
                    const exists = fs.existsSync(filePath);
                    console.log(`   File status: ${exists ? '✅ Found' : '❌ MISSING'} (${filePath})`);
                }
            } else {
                console.log('   ⚠️ No digital URL');
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkBooks();
