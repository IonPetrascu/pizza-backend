import { prisma } from '../../prisma/prisma-client.js';

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

async function createIngredient(data) {
   
    return await prisma.ingredient.create({
        data: {
            name: data.name,
            price: data.price,
            imageUrl: data.imageUrl
        }
    });
}


async function updateIngredient(id, updateData) {
    return await prisma.ingredient.update({
        where: { id },
        data: updateData
    });
}

async function deleteIngredient(id) {
    return await prisma.ingredient.delete({
        where: { id }
    });
}

export {
    getIngredientbyId,
    getAllIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient
};