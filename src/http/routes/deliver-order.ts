import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { db } from '../../db/connection'
import { eq } from 'drizzle-orm'
import { order } from '../../db/schema'

export const deliverOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/deliver',
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

    if (orderToUpdate.status !== 'delivering') {
      set.status = 400
      return {
        message: 'You cannnot deliver orders that are not delivering',
      }
    }

    await db
      .update(order)
      .set({ status: 'delivered' })
      .where(eq(order.id, orderId))
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
