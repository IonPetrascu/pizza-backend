import { prisma } from '../../prisma/prisma-client.js'

async function getIngredientbyId(id) {
    id = Number(id);
    if (isNaN(id)) throw new Error("Invalid ingredient ID");

    return await prisma.ingredient.findUnique({
        where: { id }
    });
}

async function getAllIngredients() {
    return await prisma.ingredient.findMany();
}

export { getIngredientbyId, getAllIngredients }