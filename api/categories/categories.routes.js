import express from "express";
import { 
  getCategoryById, 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "./categories.services.js";

const router = express.Router();

// Получение всех категорий
router.get("/", async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение категории по ID
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const category = await getCategoryById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создание новой категории
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    // Проверка обязательных полей
    if (!name) {
      return res.status(400).json({ error: "Missing required field: name" });
    }

    const newCategory = await createCategory({ name });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновление категории по ID
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const { name } = req.body;
    const updateData = {};

    // Добавляем только переданные поля
    if (name) updateData.name = name;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    const updatedCategory = await updateCategory(id, updateData);
    if (!updatedCategory) return res.status(404).json({ message: "Category not found" });
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удаление категории по ID
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const deleted = await deleteCategory(id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;