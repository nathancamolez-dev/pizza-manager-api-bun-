import Elysia from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import dayjs from 'dayjs'
import { db } from '../../db/connection'
import { order } from '../../db/schema'
import { and, count, eq, gte, sql } from 'drizzle-orm'

export const getDaysOrderAmount = new Elysia()
  .use(auth)
  .get('/metrics/day-order-amount', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }
    const currentDay = dayjs()
    const yesterday = currentDay.subtract(1, 'day').toDate()
    const startOfYesterday = dayjs(yesterday).startOf('day').toDate()

    const ordersPerDay = await db
      .select({
        dayWithMonthAndYear: sql<string>`TO_CHAR(${order.created_at}, 'YYYY-MM-DD')`,
        amount: count(),
      })
      .from(order)
      .where(
        and(
          eq(order.restaurantId, restaurantId),
          gte(order.created_at, startOfYesterday),
        ),
      )
      .groupBy(sql`TO_CHAR(${order.created_at}, 'YYYY-MM-DD')`)

    const todayWithMonthAndYear = dayjs(currentDay).format('YYYY-MM-DD')
    const yesterdayWithMonthAndYear = dayjs(yesterday).format('YYYY-MM-DD')

    const yesterdayOrders = ordersPerDay.find((order) => {
      return order.dayWithMonthAndYear === yesterdayWithMonthAndYear
    })

    const currentDayOrders = ordersPerDay.find((order) => {
      return order.dayWithMonthAndYear === todayWithMonthAndYear
    })

    const diffFromYesterday =
      yesterdayOrders && currentDayOrders
        ? (currentDayOrders.amount * 100) / yesterdayOrders.amount
        : null

    return {
      orders: currentDayOrders?.amount,
      diffFromYesterday: diffFromYesterday
        ? Number((diffFromYesterday - 100).toFixed(2))
        : 0,
    }
  })
