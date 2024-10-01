import Elysia from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import dayjs from 'dayjs'
import { db } from '../../db/connection'
import { order } from '../../db/schema'
import { and, eq, gte, sql, sum } from 'drizzle-orm'

export const getMonthReceipt = new Elysia()
  .use(auth)
  .get('/metrics/month-receipt', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const currentMonth = dayjs()
    const lastMonth = currentMonth.subtract(1, 'month')
    const startOfLastMonth = lastMonth.startOf('month')

    const monthsReceipts = await db
      .select({
        monthWithYear: sql<string>`TO_CHAR(${order.created_at}, 'YYYY-MM')`,
        receipt: sum(order.totalInCents).mapWith(Number),
      })
      .from(order)
      .where(
        and(
          eq(order.restaurantId, restaurantId),
          gte(order.created_at, startOfLastMonth.toDate()),
        ),
      )
      .groupBy(sql`TO_CHAR(${order.created_at}, 'YYYY-MM')`)

    const lastMonthWithYear = lastMonth.format('YYYY-MM')
    const currentMonthWithYear = currentMonth.format('YYYY-MM')

    const currentMonthReceipt = monthsReceipts.find((monthReceipt) => {
      return monthReceipt.monthWithYear === currentMonthWithYear
    })

    const lastMonthReceipt = monthsReceipts.find((monthReceipt) => {
      return monthReceipt.monthWithYear === lastMonthWithYear
    })

    const diffFromLastMonth =
      currentMonthReceipt && lastMonthReceipt
        ? (currentMonthReceipt.receipt * 100) / lastMonthReceipt.receipt
        : null

    return {
      receipt: currentMonthReceipt?.receipt,
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : 0,
    }
  })
