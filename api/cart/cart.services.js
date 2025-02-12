import { prisma } from '../../prisma/prisma-client.js'


async function getCart() {
    const token = "11111";

    return await prisma.cart.findFirst({
        where: { token },
        include: {
            items: {
                include: {
                    product: true, // если есть связь с `Product`
                }
            }
        }
    });
}




export { getCart }