// Create test admin user for Smart Library
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email: 'admin@library.com',
                password: hashedPassword,
                name: 'Admin User',
                role: 'ADMIN',
                isActive: true
            }
        });

        console.log('✅ Test admin user created successfully!');
        console.log('📧 Email: admin@library.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Role: ADMIN');

    } catch (error) {
        if (error.code === 'P2002') {
            console.log('ℹ️  User already exists!');
        } else {
            console.error('❌ Error:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();
