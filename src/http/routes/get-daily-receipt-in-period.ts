import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import dayjs from 'dayjs'
import { db } from '../../db/connection'
import { order } from '../../db/schema'
import { and, eq, gte, lte, sql, sum } from 'drizzle-orm'

export const getDailyReceiptInPeriod = new Elysia().use(auth).get(
  '/metrics/daily-receipt-in-period',
  async ({ getCurrentUser, query, set }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const { from, to } = query

    const fromDate = from ? dayjs(from) : dayjs().subtract(7, 'day')
    const endDate = to ? dayjs(to) : from ? fromDate.add(7) : dayjs()

    if (endDate.diff(fromDate, 'day') > 7) {
      set.status = 400
      return {
        error: 'Period cannot be more than 7 days',
      }
    }

    const receiptPerDay = await db
      .select({
        day: sql<string>`TO_CHAR(${order.created_at}, 'DD/MM')`,
        receipt: sum(order.totalInCents).mapWith(Number),
      })
      .from(order)
      .where(
        and(
          eq(order.restaurantId, restaurantId),
          gte(
            order.created_at,
            fromDate
              .startOf('day')
              .add(fromDate.utcOffset(), 'minutes')
              .toDate(),
          ),
          lte(
            order.created_at,
            endDate.endOf('day').add(fromDate.utcOffset(), 'minutes').toDate(),
          ),
        ),
      )
      .groupBy(sql`TO_CHAR(${order.created_at}, 'DD/MM')`)

    const orderedReceiptPerDay = receiptPerDay.sort((a, b) => {
      const [dayA, monthA] = a.day.split('/').map(Number)
      const [dayB, monthB] = b.day.split('/').map(Number)

      if (monthA === monthB) {
        return dayA - dayB
      }
      const dateA = new Date(2024, monthA - 1)
      const dateB = new Date(2024, monthB - 1)

      return dateA.getTime() - dateB.getTime()
    })

    return orderedReceiptPerDay
  },
  {
    query: t.Object({
      from: t.Optional(t.String()),
      to: t.Optional(t.String()),
    }),
  },
)
