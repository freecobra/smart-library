// Database Seeding Script
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (be careful in production!)
    console.log('Clearing existing data...');
    await prisma.borrowRecord.deleteMany({});
    await prisma.systemLog.deleteMany({});
    await prisma.book.deleteMany({});
    await prisma.user.deleteMany({});

    // Create users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@smartlib.gov.rw',
            password: hashedPassword,
            name: 'System Administrator',
            role: 'ADMIN',
            department: 'ICT Department'
        }
    });

    const librarian = await prisma.user.create({
        data: {
            email: 'librarian@smartlib.gov.rw',
            password: await bcrypt.hash('librarian123', 10),
            name: 'Library Manager',
            role: 'LIBRARIAN',
            department: 'Central Library'
        }
    });

    const student = await prisma.user.create({
        data: {
            email: 'student@smartlib.gov.rw',
            password: await bcrypt.hash('student123', 10),
            name: 'John Student',
            role: 'STUDENT',
            department: 'Computer Science',
            studentId: 'CS2024001'
        }
    });

    console.log('✅ Created 3 users');

    // Create books
    console.log('Creating books...');
    const books = [
        {
            title: 'Introduction to Algorithms',
            author: 'Thomas H. Cormen',
            isbn: '9780262033848',
            category: 'Computer Science',
            description: 'A comprehensive introduction to algorithms and data structures.',
            publicationYear: 2009,
            quantity: 5,
            availableQuantity: 5,
            coverImage: 'https://images-na.ssl-images-amazon.com/images/I/41T0iBxY8FL._SX440_BO1,204,203,200_.jpg'
        },
        {
            title: 'Clean Code',
            author: 'Robert C. Martin',
            isbn: '9780132350884',
            category: 'Software Engineering',
            description: 'A handbook of agile software craftsmanship.',
            publicationYear: 2008,
            quantity: 3,
            availableQuantity: 3,
            digitalUrl: 'https://example.com/clean-code.pdf'
        },
        {
            title: 'Design Patterns',
            author: 'Erich Gamma',
            isbn: '9780201633610',
            category: 'Software Engineering',
            description: 'Elements of reusable object-oriented software.',
            publicationYear: 1994,
            quantity: 4,
            availableQuantity: 4
        },
        {
            title: 'The Pragmatic Programmer',
            author: 'Andrew Hunt',
            isbn: '9780135957059',
            category: 'Software Engineering',
            description: 'Your journey to mastery.',
            publicationYear: 2019,
            quantity: 6,
            availableQuantity: 6
        },
        {
            title: 'Data Structures and Algorithms in Python',
            author: 'Michael T. Goodrich',
            isbn: '9781118290279',
            category: 'Computer Science',
            description: 'Comprehensive guide to data structures using Python.',
            publicationYear: 2013,
            quantity: 4,
            availableQuantity: 4,
            digitalUrl: 'https://example.com/ds-algo-python.pdf'
        },
        {
            title: 'Artificial Intelligence: A Modern Approach',
            author: 'Stuart Russell',
            isbn: '9780136042594',
            category: 'Artificial Intelligence',
            description: 'The leading textbook in Artificial Intelligence.',
            publicationYear: 2020,
            quantity: 3,
            availableQuantity: 3
        },
        {
            title: 'Database System Concepts',
            author: 'Abraham Silberschatz',
            isbn: '9780073523323',
            category: 'Database Systems',
            description: 'Comprehensive guide to database management systems.',
            publicationYear: 2010,
            quantity: 5,
            availableQuantity: 5
        },
        {
            title: 'Computer Networks',
            author: 'Andrew S. Tanenbaum',
            isbn: '9780132126953',
            category: 'Networking',
            description: 'Introduction to computer networks and protocols.',
            publicationYear: 2010,
            quantity: 4,
            availableQuantity: 4
        },
        {
            title: 'Operating System Concepts',
            author: 'Abraham Silberschatz',
            isbn: '9781118063330',
            category: 'Operating Systems',
            description: 'Essential guide to operating system design and implementation.',
            publicationYear: 2012,
            quantity: 5,
            availableQuantity: 5,
            digitalUrl: 'https://example.com/os-concepts.pdf'
        },
        {
            title: 'Machine Learning',
            author: 'Tom M. Mitchell',
            isbn: '9780070428072',
            category: 'Artificial Intelligence',
            description: 'Introduction to machine learning concepts and algorithms.',
            publicationYear: 1997,
            quantity: 3,
            availableQuantity: 3
        },
        {
            title: 'Introduction to the Theory of Computation',
            author: 'Michael Sipser',
            isbn: '9781133187790',
            category: 'Computer Science',
            description: 'Theory of computation and formal languages.',
            publicationYear: 2012,
            quantity: 4,
            availableQuantity: 4
        },
        {
            title: 'Computer Organization and Design',
            author: 'David A. Patterson',
            isbn: '9780124077263',
            category: 'Computer Architecture',
            description: 'Hardware/software interface and computer architecture.',
            publicationYear: 2013,
            quantity: 3,
            availableQuantity: 3
        },
        {
            title: 'Software Engineering',
            author: 'Ian Sommerville',
            isbn: '9780133943030',
            category: 'Software Engineering',
            description: 'Comprehensive guide to software engineering practices.',
            publicationYear: 2015,
            quantity: 5,
            availableQuantity: 5
        },
        {
            title: 'Deep Learning',
            author: 'Ian Goodfellow',
            isbn: '9780262035613',
            category: 'Artificial Intelligence',
            description: 'Comprehensive introduction to deep learning.',
            publicationYear: 2016,
            quantity: 4,
            availableQuantity: 4,
            digitalUrl: 'https://example.com/deep-learning.pdf'
        },
        {
            title: 'The Art of Computer Programming',
            author: 'Donald E. Knuth',
            isbn: '9780201896831',
            category: 'Computer Science',
            description: 'Classic comprehensive monograph on computer programming.',
            publicationYear: 1997,
            quantity: 2,
            availableQuantity: 2
        }
    ];

    const createdBooks = await Promise.all(
        books.map(book => prisma.book.create({ data: book }))
    );

    console.log(`✅ Created ${createdBooks.length} books`);

    // Create some borrow records
    console.log('Creating borrow records...');
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    // Student borrows a book
    const borrowRecord1 = await prisma.borrowRecord.create({
        data: {
            userId: student.id,
            bookId: createdBooks[0].id,
            borrowDate: threeDaysAgo,
            dueDate: sevenDaysFromNow,
            status: 'BORROWED'
        }
    });

    // Update book availability
    await prisma.book.update({
        where: { id: createdBooks[0].id },
        data: { availableQuantity: { decrement: 1 } }
    });

    // Create a returned record
    const borrowRecord2 = await prisma.borrowRecord.create({
        data: {
            userId: student.id,
            bookId: createdBooks[1].id,
            borrowDate: tenDaysAgo,
            dueDate: threeDaysAgo,
            returnDate: now,
            status: 'RETURNED',
            fineAmount: 0
        }
    });

    console.log('✅ Created 2 borrow records');

    // Create system logs
    console.log('Creating system logs...');
    await prisma.systemLog.createMany({
        data: [
            {
                userId: admin.id,
                action: 'SYSTEM_INITIALIZED',
                details: 'Database seeded with initial data'
            },
            {
                userId: student.id,
                action: 'BOOK_BORROWED',
                details: `Student borrowed: ${createdBooks[0].title}`
            },
            {
                userId: student.id,
                action: 'BOOK_RETURNED',
                details: `Student returned: ${createdBooks[1].title}`
            }
        ]
    });

    console.log('✅ Created system logs');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@smartlib.gov.rw / admin123');
    console.log('Librarian: librarian@smartlib.gov.rw / librarian123');
    console.log('Student: student@smartlib.gov.rw / student123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
