import Elysia from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { order, orderItems, product } from '../../db/schema'
import { asc, eq, sum } from 'drizzle-orm'

export const getPopularProducts = new Elysia()
  .use(auth)
  .get('/metrics/popular-products', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const popularProducts = await db
      .select({
        product: product.name,
        amount: sum(orderItems.quantity).mapWith(Number),
      })
      .from(orderItems)
      .leftJoin(order, eq(order.id, orderItems.orderId))
      .leftJoin(product, eq(product.id, orderItems.productId))
      .where(eq(order.restaurantId, restaurantId))
      .groupBy(product.name)
      .orderBy((fields) => {
        return asc(fields.amount)
      })
      .limit(5)

    return popularProducts
  })
