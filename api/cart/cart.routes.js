import express from 'express';
import {
    findOrCreateCart,
    getCartByUserId,
    addOrUpdateCartItem,
    updateCartItemQuantity,
    removeCartItem,
    updateCartTotalAmount,
    updateCartTotalAmountById
} from './cart.services.js';
import { prisma } from '../../prisma/prisma-client.js';

const router = express.Router();

// GET /cart - получение корзины по userId или token (приоритет у userId)
router.get('/', async (req, res) => {
    try {
        const userId = Number(req.query.userId) || null; // userId из query
        const token = req.headers['x-cart-token'] || null; // token из заголовка

        if (!userId && !token) {
            return res.status(400).json({ message: 'User ID or token is required' });
        }

        // Если есть userId, используем его; иначе используем token
        const userCart = await getCartByUserId(userId, token);
        res.json(userCart);
    } catch (error) {
        console.log('[CART_GET] Server error', error);
        res.status(500).json({ message: 'Не удалось получить корзину' });
    }
});

// POST /cart - добавление элемента в корзину по userId или token (приоритет у userId)
router.post('/', async (req, res) => {
    try {
        const userId = Number(req.query.userId) || null; // userId из query
        const token = req.headers['x-cart-token'] || null; // token из заголовка
        const data = req.body; // { productId, ingredients }

        /*      if (!userId && !token) {
                 return res.status(400).json({ message: 'User ID or token is required' });
             } */

        // Если есть userId, создаем/находим корзину по userId; иначе по token
        const userCart = await findOrCreateCart(token, userId);
        await addOrUpdateCartItem(userCart.id, data);
        const updatedUserCart = await updateCartTotalAmount(userId, userCart.token);

        res.json({ cart: updatedUserCart, token: userCart.token });
    } catch (error) {
        console.log('[CART_POST] Server error', error);
        res.status(500).json({ message: 'Не удалось создать корзину' });
    }
});

// PATCH /cart/:id - обновление количества элемента с приоритетом userId
router.patch('/:id', async (req, res) => {
    try {
        const cartItemId = Number(req.params.id);
        const userId = Number(req.query.userId) || null;
        const token = req.headers['x-cart-token'] || null;
        const { quantity } = req.body;

        if (!userId && !token) {
            return res.status(401).json({ error: 'User ID or token is required' });
        }

        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: {
                cart: true,
            },
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        // Проверяем принадлежность корзины с приоритетом userId
        if (userId) {
            if (cartItem.cart.userId !== userId) {
                console.log(`[CART_PATCH] Mismatch: userId=${userId}, cart.userId=${cartItem.cart.userId}, cartId=${cartItem.cartId}`);
                return res.status(403).json({
                    error: 'Invalid user ID',
                    details: `Cart belongs to userId=${cartItem.cart.userId}, not ${userId}`
                });
            }
        } else if (token) {
            if (cartItem.cart.token !== token) {
                return res.status(403).json({ error: 'Invalid token' });
            }
        }

        await updateCartItemQuantity(cartItemId, quantity);
        const updatedUserCart = await updateCartTotalAmountById(cartItem.cartId);

        res.json(updatedUserCart);
    } catch (error) {
        console.log('[CART_PATCH] Server error', error);
        if (error.message === 'Cart item not found') {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        res.status(500).json({ message: 'Не удалось обновить корзину' });
    }
});

// DELETE /cart/:id - удаление элемента из корзины с приоритетом userId
router.delete('/:id', async (req, res) => {
    try {
        const cartItemId = Number(req.params.id); // ID элемента корзины
        const userId = Number(req.query.userId) || null; // userId из query
        const token = req.headers['x-cart-token'] || null; // token из заголовка

        // Проверяем наличие идентификатора
        if (!userId && !token) {
            return res.status(401).json({ error: 'User ID or token is required' });
        }

        // Находим CartItem с учетом корзины
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: {
                cart: true, // Включаем данные корзины для проверки
            },
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        // Проверяем принадлеж):</ность корзины с приоритетом userId
        if (userId) {
            if (cartItem.cart.userId !== userId) {
                return res.status(403).json({ error: 'Invalid user ID' });
            }
        } else if (token) {
            if (cartItem.cart.token !== token) {
                return res.status(403).json({ error: 'Invalid token' });
            }
        }

        // Удаляем элемент из корзины
        await removeCartItem(cartItemId);

        // Обновляем корзину по cartId
        const updatedUserCart = await updateCartTotalAmountById(cartItem.cartId);

        res.json(updatedUserCart);
    } catch (error) {
        console.log('[CART_DELETE] Server error', error);
        if (error.message === 'Cart item not found') {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        res.status(500).json({ message: 'Не удалось удалить элемент из корзины' });
    }
});

router.get('/all', async (req, res) => {
    try {
        const carts = await prisma.cart.findMany({
            include: {
                items: {
                    include: {
                        product: true,
                        ingredients: true,
                    },
                },
            },
        });

        res.json(carts); // Возвращаем все корзины с их элементами
    } catch (error) {
        console.log('[CART_GET_ALL] Server error', error);
        res.status(500).json({ message: 'Не удалось получить корзины' });
    }
});

export default router;