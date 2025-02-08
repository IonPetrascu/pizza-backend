import express from "express"
import { getIngredientbyId, getAllIngredients } from "./ingredients.services.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const ingredients = await getAllIngredients();
        res.json(ingredients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

export default router