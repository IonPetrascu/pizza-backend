import { prisma } from '../../prisma/prisma-client.js'


async function getProductById(id) {
  id = Number(id);
  if (isNaN(id)) throw new Error("Invalid product ID");

  return await prisma.product.findUnique({
    where: { id }
  });
}

// async function getAllProducts() {
//   return await prisma.product.findMany();
// }
async function getAllProducts({ minPrice, maxPrice }) {
  const whereClause = {};

  if (minPrice !== undefined && minPrice !== null) {
    whereClause.price = { ...whereClause.price, gte: Number(minPrice) };
  }

  if (maxPrice !== undefined && maxPrice !== null) {
    whereClause.price = { ...whereClause.price, lte: Number(maxPrice) };
  }

  return await prisma.product.findMany({ where: whereClause });
}


async function createProduct({ name, imageUrl, price, categoryId }) {
  return await prisma.product.create({
    data: {
      name,
      imageUrl,
      price,
      categoryId
    },
  });
}

async function deleteProduct(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return null;

  await prisma.product.delete({ where: { id } });
  return product;
}

async function updateProduct(id, updateData) {
  return prisma.product.update({
    where: { id },
    data: updateData
  });
};


async function getProductsByName(name) {
  return await prisma.product.findMany({
    where: {
      name: {
        contains: name,
        mode: 'insensitive',
      },
    },
  });
};

// Получение похожих товаров по categoryId
const getSimilarProductsByCategory = async (categoryId, excludeId) => {
  return prisma.product.findMany({
    where: {
      categoryId,
      id: { not: excludeId }, // Исключаем сам товар
    },
    take: 10, // Ограничиваем количество похожих товаров
  });
};

export {
  getProductById,
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProductsByName,
  getSimilarProductsByCategory
}
