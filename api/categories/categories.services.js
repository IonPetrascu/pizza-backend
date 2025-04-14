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

// async function getAllCategories() {
//   return await prisma.category.findMany({
//     include: {
//       products: {
//         include: {
//           ingredients: true
//         }
//       }
//     }
//   });
// }
async function getAllCategories({ priceFrom, priceTo }) {
  const whereClause = {};

  // Проверяем, если хотя бы один из параметров цены передан
  if (priceFrom !== undefined || priceTo !== undefined) {
    whereClause.products = {
      some: {
        price: {
          gte: priceFrom || 0, // Если priceFrom не передан, то используем 0
          lte: priceTo !== undefined ? priceTo : undefined, // Если priceTo не передан, то не передаем lte
        }
      }
    };
  }

  return await prisma.category.findMany({
    where: whereClause,
    include: {
      products: {
        where: {
          price: {
            gte: priceFrom || 0,
            lte: priceTo !== undefined ? priceTo : undefined, // Тоже проверяем, передан ли priceTo
          }
        },
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
