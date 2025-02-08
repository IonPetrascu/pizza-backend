import { prisma } from '../../prisma/prisma-client.js'


async function getProductById(id) {
    id = Number(id);
    if (isNaN(id)) throw new Error("Invalid product ID");

    return await prisma.product.findUnique({
        where: { id }
    });
}

async function getAllProducts() {
    return await prisma.product.findMany();
}

export { getProductById, getAllProducts }