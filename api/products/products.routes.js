import express from "express";
import { getProductById, getAllProducts, createProduct, deleteProduct, updateProduct, getProductsByName, getSimilarProductsByCategory } from "./products.services.js";

const router = express.Router();

// Получение всех продуктов
// router.get("/", async (req, res) => {
//   try {
//     const products = await getAllProducts();
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.get("/", async (req, res) => {
  try {
    const { ingredients, priceFrom, priceTo } = req.query;

    // Преобразуем параметры
    const ingredientIds = ingredients ? ingredients.split(",").map(Number) : [];
    const minPrice = priceFrom ? Number(priceFrom) : null;
    const maxPrice = priceTo ? Number(priceTo) : null;
    // Проверяем корректность данных
    if (ingredientIds.some(isNaN) || (minPrice && isNaN(minPrice)) || (maxPrice && isNaN(maxPrice))) {
      return res.status(400).json({ error: "Invalid filter parameters" });
    }

    const products = await getAllProducts({ ingredientIds, minPrice, maxPrice });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/search", async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Name query parameter is required" });
  }

  try {
    const products = await getProductsByName(name);

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found with that name" });
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение продукта по ID
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const product = await getProductById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создание нового продукта
router.post("/", async (req, res) => {
  try {
    const { name, imageUrl, price, categoryId } = req.body;
    if (!name || !imageUrl || !price || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newProduct = await createProduct({ name, imageUrl, price, categoryId });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удаление продукта по ID
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const deleted = await deleteProduct(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Обновление продукта по ID
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const { name, imageUrl, price, categoryId } = req.body;
    // Можно сделать поля опциональными для обновления
    const updateData = {};
    if (name) updateData.name = name;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (price) updateData.price = price;
    if (categoryId) updateData.categoryId = categoryId;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    const updatedProduct = await updateProduct(id, updateData);
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение похожих товаров по categoryId
router.get("/similar/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const product = await getProductById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const similarProducts = await getSimilarProductsByCategory(product.categoryId, id);
    res.json(similarProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;
