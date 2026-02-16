// Quick script to seed the database with test users
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
    try {
        console.log('Seeding database with test users...');

        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create Admin
        const admin = await prisma.user.create({
            data: {
                email: 'admin@smartlib.com',
                password: hashedPassword,
                name: 'Admin User',
                role: 'ADMIN',
                isActive: true
            }
        });
        console.log('✅ Admin created:', admin.email);

        // Create Librarian
        const librarian = await prisma.user.create({
            data: {
                email: 'librarian@smartlib.com',
                password: hashedPassword,
                name: 'Librarian User',
                role: 'LIBRARIAN',
                department: 'Library Services',
                isActive: true
            }
        });
        console.log('✅ Librarian created:', librarian.email);

        // Create Student
        const student = await prisma.user.create({
            data: {
                email: 'student@smartlib.com',
                password: hashedPassword,
                name: 'Student User',
                role: 'STUDENT',
                department: 'Computer Science',
                studentId: 'STD001',
                isActive: true
            }
        });
        console.log('✅ Student created:', student.email);

        console.log('\n📝 Login credentials (all use password: "password123"):');
        console.log('Admin: admin@smartlib.com');
        console.log('Librarian: librarian@smartlib.com');
        console.log('Student: student@smartlib.com');

    } catch (error) {
        console.error('❌ Error seeding users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedUsers();
