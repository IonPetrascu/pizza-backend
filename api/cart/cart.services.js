import { prisma } from '../../prisma/prisma-client.js';
import { randomUUID } from "crypto"; // Для генерации токена

// Поиск или создание корзины по token или userId
export async function findOrCreateCart(token = null, userId = null) {
  let cart;

  // Если токен передан, ищем корзину по токену
  if (token) {
    cart = await prisma.cart.findUnique({
      where: { token },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
          include: {
            product: true,
            ingredients: true,
          },
        },
      },
    });
  }

  // Если токена нет, но есть userId, ищем по userId
  if (!cart && userId) {
    cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
          include: {
            product: true,
            ingredients: true,
          },
        },
      },
    });
  }

  // Если корзины нет, создаем новую с токеном
  if (!cart) {
    const newToken = token || randomUUID(); // Используем переданный токен или генерируем новый
    cart = await prisma.cart.create({
      data: {
        userId, // Может быть null для гостя
        token: newToken,
        totalAmount: 0,
      },
      include: {
        items: {
          include: {
            product: true,
            ingredients: true,
          },
        },
      },
    });
  }

  return cart;
}

// Получение корзины по userId или token
export async function getCartByUserId(userId, token = null) {
  let cart;

  // Сначала ищем по userId, если он есть
  if (userId) {
    cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
          include: {
            product: true,
            ingredients: true,
          },
        },
      },
    });
  }

  // Если корзины по userId нет, ищем по токену
  if (!cart && token) {
    cart = await prisma.cart.findUnique({
      where: { token },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
          include: {
            product: true,
            ingredients: true,
          },
        },
      },
    });
  }

  return cart || { totalAmount: 0, items: [], token: token || randomUUID() };
}

// Добавление или обновление элемента в корзине (оставляем без изменений)
export async function addOrUpdateCartItem(cartId, data) {
  const { productId, ingredients, quantity = 1 } = data;

  const findCartItem = await prisma.cartItem.findFirst({
    where: {
      cartId,
      productId,
      ingredients: {
        every: {
          id: { in: ingredients },
        },
      },
    },
  });

  if (findCartItem) {
    return await prisma.cartItem.update({
      where: { id: findCartItem.id },
      data: { quantity: findCartItem.quantity + quantity },
    });
  } else {
    return await prisma.cartItem.create({
      data: {
        cartId,
        productId,
        quantity,
        ingredients: { connect: ingredients?.map((id) => ({ id })) },
      },
    });
  }
}

// Обновление количества элемента в корзине (без изменений)
export async function updateCartItemQuantity(cartItemId, quantity) {
  const cartItem = await prisma.cartItem.findFirst({
    where: { id: cartItemId },
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  return await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
}

// Удаление элемента из корзины (без изменений)
export async function removeCartItem(cartItemId) {
  const cartItem = await prisma.cartItem.findFirst({
    where: { id: cartItemId },
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  return await prisma.cartItem.delete({
    where: { id: cartItemId },
  });
}

// Обновление общей суммы корзины (адаптируем под token)
export async function updateCartTotalAmount(userId, token = null) {
  let cart;

  if (userId) {
    cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            ingredients: true,
          },
        },
      },
    });
  } else if (token) {
    cart = await prisma.cart.findUnique({
      where: { token },
      include: {
        items: {
          include: {
            product: true,
            ingredients: true,
          },
        },
      },
    });
  }

  if (!cart) {
    throw new Error('Cart not found');
  }

  const totalAmount = cart.items.reduce((sum, item) => {
    const ingredientsPrice = item.ingredients.reduce((acc, ing) => acc + ing.price, 0);
    return sum + item.quantity * (item.product.price + ingredientsPrice);
  }, 0);

  return await prisma.cart.update({
    where: { id: cart.id },
    data: { totalAmount },
    include: {
      items: {
        include: {
          product: true,
          ingredients: true,
        },
      },
    },
  });
}

export async function updateCartTotalAmountById(cartId) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
          ingredients: true,
        },
      },
    },
  });

  if (!cart) {
    throw new Error('Cart not found');
  }

  const totalAmount = cart.items.reduce((sum, item) => {
    const ingredientsPrice = item.ingredients.reduce((acc, ing) => acc + ing.price, 0);
    return sum + item.quantity * (item.product.price + ingredientsPrice);
  }, 0);

  return await prisma.cart.update({
    where: { id: cart.id },
    data: { totalAmount },
    include: {
      items: {
        include: {
          product: true,
          ingredients: true,
        },
      },
    },
  });
}

export async function mergeCarts(guestCartId, userCartId) {
  // Получаем все элементы гостевой корзины с их ингредиентами
  const guestItems = await prisma.cartItem.findMany({
    where: { cartId: guestCartId },
    include: {
      ingredients: true, // Включаем ингредиенты для точного сравнения
    },
  });

  // Обрабатываем каждый элемент гостевой корзины
  for (const item of guestItems) {
    // Проверяем, есть ли такой же элемент в корзине пользователя
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: userCartId,
        productId: item.productId,
        ingredients: {
          every: { id: { in: item.ingredients.map(i => i.id) } }, // Сравниваем по ингредиентам
        },
      },
      include: {
        ingredients: true,
      },
    });

    if (existingItem) {
      // Если элемент уже есть, увеличиваем количество
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + item.quantity },
      });
    } else {
      // Если элемента нет, создаем новый в корзине пользователя
      await prisma.cartItem.create({
        data: {
          cartId: userCartId,
          productId: item.productId,
          quantity: item.quantity,
          ingredients: {
            connect: item.ingredients.map(ing => ({ id: ing.id })), // Подключаем те же ингредиенты
          },
        },
      });
    }

    // Удаляем элемент из гостевой корзины
    await prisma.cartItem.delete({ where: { id: item.id } });
  }

  // Проверяем, осталась ли гостевая корзина пустой, и удаляем её
  const remainingItems = await prisma.cartItem.count({ where: { cartId: guestCartId } });
  if (remainingItems === 0) {
    await prisma.cart.delete({ where: { id: guestCartId } });
  }

  // Пересчитываем общую сумму корзины пользователя
  const userCart = await prisma.cart.findUnique({
    where: { id: userCartId },
    include: {
      items: {
        include: {
          product: true,
          ingredients: true,
        },
      },
    },
  });

  const totalAmount = userCart.items.reduce((sum, item) => {
    const ingredientsPrice = item.ingredients.reduce((acc, ing) => acc + ing.price, 0);
    return sum + item.quantity * (item.product.price + ingredientsPrice);
  }, 0);

  // Обновляем корзину пользователя с новой суммой
  return await prisma.cart.update({
    where: { id: userCartId },
    data: { totalAmount },
    include: {
      items: {
        include: {
          product: true,
          ingredients: true,
        },
      },
    },
  });
}