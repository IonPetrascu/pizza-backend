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


export {
  getProductById,
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProductsByName
}
