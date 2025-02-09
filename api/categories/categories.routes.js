import express from "express"
import { getCategoryById, getAllCategories } from "./categories.services.js";

const router = express.Router();

// Получение всех продуктов
router.get("/", async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение продукта по ID
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    try {
        const product = await getCategoryById(id);
        if (!product) return res.status(404).json({ message: "Category not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router