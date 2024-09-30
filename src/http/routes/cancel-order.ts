import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { db } from '../../db/connection'
import { eq } from 'drizzle-orm'
import { order } from '../../db/schema'

export const cancelOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/cancel',
  async ({ getCurrentUser, params, set }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }
    const orderToUpdate = await db.query.order.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, orderId)
      },
    })

    if (!orderToUpdate) {
      set.status = 404
      return {
        message: 'Order not found',
      }
    }

    if (!['pending', 'preparing'].includes(orderToUpdate.status)) {
      set.status = 400
      return {
        message: 'You can only cancel pending orders or preparing orders',
      }
    }

    await db
      .update(order)
      .set({ status: 'cancelled' })
      .where(eq(order.id, orderId))
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
