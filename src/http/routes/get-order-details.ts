import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getOrderDetails = new Elysia().use(auth).get(
  '/orders/:orderId',
  async ({ getCurrentUser, params, set }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const UserOrder = await db.query.order.findFirst({
      columns: {
        id: true,
        status: true,
        totalInCents: true,
        created_at: true,
      },
      with: {
        customer: {
          columns: {
            name: true,
            email: true,
          },
        },
        orderItems: {
          columns: {
            id: true,
            priceInCents: true,
            quantity: true,
          },
          with: {
            product: {
              columns: {
                name: true,
              },
            },
          },
        },
      },
      where(fields, { eq }) {
        return eq(fields.id, orderId)
      },
    })

    if (!UserOrder) {
      set.status = 404
      return {
        message: 'Order not found',
      }
    }

    return {
      order: UserOrder,
    }
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
