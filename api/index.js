import express from 'express'
import products from './products/products.routes.js'
import ingredients from './ingredients/ingredients.routes.js'

const router = express.Router();

// Base API response
router.get("/", (req, res) => {
    res.json({
        message: "API - 👋🌎🌍🌏",
    });
});

router.use("/products", products);
router.use("/ingredients", ingredients);



export default router