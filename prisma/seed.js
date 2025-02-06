/* import { prisma } from './prisma-client'

async function up() {
    await prisma.user.createMany({
        data: [
            {
                name: 'User Test',
                email: 'user@test.ru',
            },
            {
                name: 'Admin Admin', // Исправлено с fullName на name
                email: 'admin@test.ru',
            },
        ],
    });
}

async function down() {
    await prisma.user.deleteMany(); 
}

async function main() {
    try {
        await down();
        await up();
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
 */

import { PrismaClient } from '@prisma/client'; // Вместо 'prisma/prisma-client'

const prisma = new PrismaClient();

async function up() {
    await prisma.user.createMany({
        data: [
            {
                name: 'User Test',
                email: 'user@test.ru',
            },
            {
                name: 'Admin Admin',
                email: 'admin@test.ru',
            },
        ],
    });
}

async function down() {
    await prisma.user.deleteMany();
}

async function main() {
    try {
        await down();
        await up();
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
