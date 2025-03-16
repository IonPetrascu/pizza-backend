import express from "express";
import { getIngredientbyId, getAllIngredients, updateIngredient, deleteIngredient, createIngredient } from "./ingredients.services.js";

const router = express.Router();

// Получение всех ингредиентов
router.get("/", async (req, res) => {
    try {
        const ingredients = await getAllIngredients();
        res.json(ingredients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение ингредиента по ID
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    try {
        const ingredient = await getIngredientbyId(id);
        if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });
        res.json(ingredient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Создание нового ингредиента
router.post("/", async (req, res) => {
    try {
        const { name, price, imageUrl } = req.body;
       
        if (!name || price === undefined || !imageUrl) {
            return res.status(400).json({ error: "Missing required fields: name, price, and imageUrl are required" });
        }

        const newIngredient = await createIngredient({ name, price, imageUrl });
        
        res.status(201).json(newIngredient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Обновление ингредиента по ID
router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    try {
        const { name, price, imageUrl } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (price !== undefined) updateData.price = price;
        if (imageUrl) updateData.imageUrl = imageUrl;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No fields provided for update" });
        }

        const updatedIngredient = await updateIngredient(id, updateData);
        if (!updatedIngredient) return res.status(404).json({ message: "Ingredient not found" });
        res.json(updatedIngredient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Удаление ингредиента по ID
router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    try {
        const deleted = await deleteIngredient(id);
        if (!deleted) return res.status(404).json({ message: "Ingredient not found" });
        res.json({ message: "Ingredient deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;