import Elysia, { t } from 'elysia'
import { db } from '../../db/connection'
import dayjs from 'dayjs'
import { auth } from '../auth'
import { authLink } from '../../db/schema/'
import { eq } from 'drizzle-orm'

export const authenticateFromLink = new Elysia().use(auth).get(
  '/auth-links/authenticate',
  async ({ query, jwt, cookie: { auth }, set }) => {
    const { code, redirect } = query

    const authLinkFromCode = await db.query.authLink.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code)
      },
    })

    if (!authLinkFromCode) {
      throw new Error('Auth link not found')
    }

    const daysSinceAuthLinkCreation = dayjs().diff(
      authLinkFromCode.createdAt,
      'days',
    )

    if (daysSinceAuthLinkCreation > 7) {
      throw new Error('Auth link expired')
    }

    const managedRestaurant = await db.query.restaurant.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerId, authLinkFromCode.userId)
      },
    })

    const token = jwt.sign({
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurant?.id,
    })

    auth.value = await token
    auth.httpOnly = true
    auth.maxAge = 60 * 60 * 24 * 7 // 1 week
    auth.path = '/'

    await db.delete(authLink).where(eq(authLink.code, code))

    set.redirect = redirect
  },
  {
    query: t.Object({
      code: t.String(),
      redirect: t.String(),
    }),
  },
)
