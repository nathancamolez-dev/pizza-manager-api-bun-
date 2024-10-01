import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { createSelectSchema } from 'drizzle-typebox'
import { order, user } from '../../db/schema'
import { and, count, eq, getTableColumns, ilike } from 'drizzle-orm'

export const getOrders = new Elysia().use(auth).get(
  '/orders',
  async ({ getCurrentUser, query }) => {
    const { restaurantId } = await getCurrentUser()
    const { customerName, orderId, status, pageIndex } = query

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const orderTableColumns = getTableColumns(order)
    const baseQuery = db
      .select({
        orderTableColumns,
      })
      .from(order)
      .innerJoin(user, eq(order.customerId, user.id))
      .where(
        and(
          eq(order.restaurantId, restaurantId),
          customerName ? ilike(user.name, `%${customerName}%`) : undefined,
          orderId ? ilike(order.id, `%${orderId}%`) : undefined,
          status ? eq(order.status, status) : undefined,
        ),
      )

    const [amountOfOrdersQuery, allOrders] = await Promise.all([
      db.select({ count: count() }).from(baseQuery.as('baseQuery')),
      db
        .select()
        .from(baseQuery.as('baseQuery'))
        .limit(10)
        .offset(pageIndex * 10),
    ])

    const amountOfOrders = amountOfOrdersQuery[0].count

    return {
      orders: allOrders,
      meta: {
        pageIndex,
        perPage: 10,
        totalCount: amountOfOrders,
      },
    }
  },
  {
    query: t.Object({
      customerName: t.Optional(t.String()),
      orderId: t.Optional(t.String()),
      status: t.Optional(createSelectSchema(order).properties.status),
      pageIndex: t.Numeric({ minimum: 0 }),
    }),
  },
)
