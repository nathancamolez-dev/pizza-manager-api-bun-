import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { db } from '../../db/connection'
import { eq } from 'drizzle-orm'
import { order } from '../../db/schema'

export const dispatchOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/dispatch',
  async ({ getCurrentUser, params, set }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }
    const orderToUpdate = await db.query.order.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, orderId),
          eq(fields.restaurantId, restaurantId),
        )
      },
    })

    if (!orderToUpdate) {
      set.status = 404
      return {
        message: 'Order not found',
      }
    }

    if (orderToUpdate.status !== 'preparing') {
      set.status = 400
      return {
        message: 'You can only dispatch orders that are preparing',
      }
    }

    await db
      .update(order)
      .set({ status: 'delivering' })
      .where(eq(order.id, orderId))
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
