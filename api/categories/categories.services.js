import { prisma } from '../../prisma/prisma-client.js';

async function getCategoryById(id) {
  id = Number(id);
  if (isNaN(id)) throw new Error("Invalid category ID");

  return await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          ingredients: true
        }
      }
    }
  });
}

async function getAllCategories() {
  return await prisma.category.findMany({
    include: {
      products: {
        include: {
          ingredients: true
        }
      }
    }
  });
}

async function createCategory(data) {
  return await prisma.category.create({
    data: {
      name: data.name
    }
  });
}

async function updateCategory(id, updateData) {
  return await prisma.category.update({
    where: { id },
    data: updateData,
    include: {
      products: {
        include: {
          ingredients: true
        }
      }
    }
  });
}

async function deleteCategory(id) {
  return await prisma.category.delete({
    where: { id }
  });
}

export { 
  getCategoryById, 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
};