import express from 'express'
import products from './products/products.routes.js'

const router = express.Router();

// Base API response
router.get("/", (req, res) => {
    res.json({
        message: "API - 👋🌎🌍🌏",
    });
});

router.use("/products", products);



export default router