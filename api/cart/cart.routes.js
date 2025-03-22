// export default router;
import express from 'express';
import jwt from 'jsonwebtoken';
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

// Секретный ключ для проверки JWT от вашего бэкенда
const BACKEND_JWT_SECRET = process.env.BACKEND_JWT_SECRET || 'your-backend-jwt-secret';

// GET /cart - получение корзины по userId с Bearer token или по x-cart-token для гостя
router.get('/', async (req, res) => {
    try {
        const userIdFromQuery = Number(req.query.userId) || null; // userId из query
        const cartToken = req.headers['x-cart-token'] || null; // Токен гостевой корзины
        const authHeader = req.headers['authorization']; // Bearer token от бэкенда

        let userId = null;

        // Проверяем Bearer token от бэкенда
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            console.log('Received token:', token); // Логируем токен
            console.log("key", BACKEND_JWT_SECRET)
            console.log("DECODED", jwt.verify(token, BACKEND_JWT_SECRET));

            try {


                const decoded = jwt.verify(token, BACKEND_JWT_SECRET);
                console.log('Decoded token:', decoded); // Логируем декодированные данные
                userId = Number(decoded.id);
                if (userIdFromQuery && userIdFromQuery !== userId) {
                    return res.status(403).json({ message: 'Invalid user ID: does not match authenticated user' });
                }
            } catch (jwtError) {
                console.log('JWT Error:', jwtError.message); // Логируем точную ошибку
                return res.status(401).json({ message: 'Invalid or expired Bearer token' });
            }
        }

        // Если есть аутентифицированный userId
        if (userId) {
            const userCart = await getCartByUserId(userId, null);
            return res.json(userCart);
        }

        // Если userId передан без токена - запрещаем
        if (userIdFromQuery && !authHeader) {
            return res.status(401).json({ message: 'Bearer token is required to access cart by userId' });
        }

        // Гостевая корзина: если есть cartToken, используем его
        if (cartToken) {
            const guestCart = await getCartByUserId(null, cartToken);
            return res.json(guestCart);
        }

        // Если нет ни токена, ни userId, создаем новую гостевую корзину
        const newCart = await findOrCreateCart(null, null);
        res.json({ cart: newCart, token: newCart.token });
    } catch (error) {
        console.log('[CART_GET] Server error', error);
        res.status(500).json({ message: 'Не удалось получить корзину' });
    }
});

// POST /cart - добавление элемента в корзину
router.post('/', async (req, res) => {
    try {
        const userId = Number(req.query.userId) || null;
        const token = req.headers['x-cart-token'] || null;
        const data = req.body;

        const userCart = await findOrCreateCart(token, userId);
        await addOrUpdateCartItem(userCart.id, data);
        const updatedUserCart = await updateCartTotalAmount(userId, userCart.token);

        res.json({ cart: updatedUserCart, token: userCart.token });
    } catch (error) {
        console.log('[CART_POST] Server error', error);
        res.status(500).json({ message: 'Не удалось создать корзину' });
    }
});

// PATCH /cart/:id - обновление количества элемента
router.patch('/:id', async (req, res) => {
    try {
        const cartItemId = Number(req.params.id);
        const userIdFromQuery = Number(req.query.userId) || null;
        const cartToken = req.headers['x-cart-token'] || null;
        const authHeader = req.headers['authorization'];
        const { quantity } = req.body;

        let userId = null;

        // Проверяем Bearer token
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, BACKEND_JWT_SECRET);
                userId = Number(decoded.id);
                if (userIdFromQuery && userIdFromQuery !== userId) {
                    return res.status(403).json({ error: 'User ID in query does not match authenticated user' });
                }
            } catch (jwtError) {
                return res.status(401).json({ error: 'Invalid or expired Bearer token' });
            }
        } else if (!userIdFromQuery && !cartToken) {
            return res.status(401).json({ error: 'Bearer token, User ID, or cart token is required' });
        }

        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: { cart: true },
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        // Проверка авторизации
        if (userId && cartItem.cart.userId !== userId) {
            return res.status(403).json({ error: 'Invalid user ID' });
        } else if (cartToken && cartItem.cart.token !== cartToken) {
            return res.status(403).json({ error: 'Invalid cart token' });
        } else if (!userId && !cartToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await updateCartItemQuantity(cartItemId, quantity);
        const updatedUserCart = await updateCartTotalAmountById(cartItem.cartId);

        res.json(updatedUserCart);
    } catch (error) {
        console.log('[CART_PATCH] Server error', error);
        res.status(500).json({ message: 'Не удалось обновить корзину' });
    }
});

// DELETE /cart/:id - удаление элемента из корзины
router.delete('/:id', async (req, res) => {
    try {
        const cartItemId = Number(req.params.id);
        const userIdFromQuery = Number(req.query.userId) || null;
        const cartToken = req.headers['x-cart-token'] || null;
        const authHeader = req.headers['authorization'];

        let userId = null;

        // Проверяем Bearer token
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, BACKEND_JWT_SECRET);
                userId = Number(decoded.id);
                if (userIdFromQuery && userIdFromQuery !== userId) {
                    return res.status(403).json({ error: 'User ID in query does not match authenticated user' });
                }
            } catch (jwtError) {
                return res.status(401).json({ error: 'Invalid or expired Bearer token' });
            }
        } else if (!userIdFromQuery && !cartToken) {
            return res.status(401).json({ error: 'Bearer token, User ID, or cart token is required' });
        }

        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: { cart: true },
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        // Проверка авторизации
        if (userId && cartItem.cart.userId !== userId) {
            return res.status(403).json({ error: 'Invalid user ID' });
        } else if (cartToken && cartItem.cart.token !== cartToken) {
            return res.status(403).json({ error: 'Invalid cart token' });
        } else if (!userId && !cartToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await removeCartItem(cartItemId);
        const updatedUserCart = await updateCartTotalAmountById(cartItem.cartId);

        res.json(updatedUserCart);
    } catch (error) {
        console.log('[CART_DELETE] Server error', error);
        res.status(500).json({ message: 'Не удалось удалить элемент из корзины' });
    }
});

// GET /cart/all - получение всех корзин
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
        res.json(carts);
    } catch (error) {
        console.log('[CART_GET_ALL] Server error', error);
        res.status(500).json({ message: 'Не удалось получить корзины' });
    }
});

export default router;