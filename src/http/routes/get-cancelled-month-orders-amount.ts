import Elysia from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import dayjs from 'dayjs'
import { db } from '../../db/connection'
import { order } from '../../db/schema'
import { and, count, eq, gte, sql } from 'drizzle-orm'

export const getMonthCancelledOrderAmount = new Elysia()
  .use(auth)
  .get('/metrics/month-cancelled-order-amount', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }
    const currentMonth = dayjs()
    const lastMonth = currentMonth.subtract(1, 'month')
    const startOfLastMonth = lastMonth.startOf('month')

    const ordersPerDay = await db
      .select({
        MonthAndYear: sql<string>`TO_CHAR(${order.created_at}, 'MM-YYYY')`,
        amount: count(),
      })
      .from(order)
      .where(
        and(
          eq(order.restaurantId, restaurantId),
          eq(order.status, 'cancelled'),
          gte(order.created_at, startOfLastMonth.toDate()),
        ),
      )
      .groupBy(sql`TO_CHAR(${order.created_at}, 'MM-YYYY')`)

    const currentMonthWithMonthAndYear = dayjs(currentMonth).format('MM-YYYY')
    const lastMonthWithMonthAndYear = dayjs(lastMonth).format('MM-YYYY')

    const lastMonthOrders = ordersPerDay.find((order) => {
      return order.MonthAndYear === lastMonthWithMonthAndYear
    })

    const currentMonthOrders = ordersPerDay.find((order) => {
      return order.MonthAndYear === currentMonthWithMonthAndYear
    })

    const diffFromLastMonth =
      lastMonthOrders && currentMonthOrders
        ? (currentMonthOrders.amount * 100) / lastMonthOrders.amount
        : null

    return {
      orders: currentMonthOrders?.amount,
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : 0,
    }
  })
