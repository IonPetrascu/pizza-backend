import express from "express";
import { login, register } from "./auth.services.js";
import { findOrCreateCart, mergeCarts } from "../cart/cart.services.js";
import { prisma } from "../../prisma/prisma-client.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password, cartToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await login(email, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    let finalCartToken = cartToken;
    if (cartToken) {
      const guestCart = await findOrCreateCart(cartToken);
      const userCart = await findOrCreateCart(null, user.id);

      if (guestCart.id !== userCart.id) {
        await mergeCarts(guestCart.id, userCart.id);
      }
      finalCartToken = userCart.token;
    } else {
      const userCart = await findOrCreateCart(null, user.id);
      finalCartToken = userCart.token;
    }

    // Используем токен из login вместо перегенерации
    res.json({ ...user, cartToken: finalCartToken });
  } catch (error) {
    console.log('[AUTH_LOGIN] Server error', error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, cartToken } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields: fullName, email, or password" });
    }

    const newUser = await register({ fullName, email, password });

    let finalCartToken = cartToken;
    if (cartToken) {
      const guestCart = await findOrCreateCart(cartToken);
      if (guestCart) {
        await prisma.cart.update({
          where: { token: cartToken },
          data: { userId: newUser.id },
        });
        finalCartToken = guestCart.token;
      }
    } else {
      const newCart = await findOrCreateCart(null, newUser.id);
      finalCartToken = newCart.token;
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(201).json({ ...newUser, token, cartToken: finalCartToken });
  } catch (error) {
    console.log('[AUTH_REGISTER] Server error', error);
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: error.message });
  }
});
export default router;