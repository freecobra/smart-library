// List all users in database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });

        console.log(`\n📊 Total users in database: ${users.length}\n`);

        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Active: ${user.isActive}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log('');
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
