import express from "express"
import { getCart } from "./cart.services.js";

const router = express.Router();

// Получение всех продуктов
router.get("/", async (req, res) => {
    try {
        const cart = await getCart();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



export default router