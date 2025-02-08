import { prisma } from '../../prisma/prisma-client.js'


async function getCategoryById(id) {
    id = Number(id);
    if (isNaN(id)) throw new Error("Invalid category ID");

    return await prisma.category.findUnique({
        where: { id }
    });

}

async function getAllCategories() {
    return await prisma.category.findMany({
        include: {
            products: true,
        },
    });
}

export { getCategoryById, getAllCategories }