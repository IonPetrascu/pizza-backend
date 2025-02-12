import { prisma } from '../../prisma/prisma-client.js'


async function getCart(/* token, userId */) {

    const token = "11111"

    return await prisma.cart.findFirst({
        where: { OR: [{ token }, { userId }] },
        include: {
            products: {
                include: { ingredients: true }
            }
        }
    }
    )

}



export { getCart }