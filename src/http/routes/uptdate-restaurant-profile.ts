import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { eq } from 'drizzle-orm'
import { restaurant } from '../../db/schema'

export const updateRestaurantProfile = new Elysia().use(auth).put(
  '/profile',
  async ({ getCurrentUser, body }) => {
    const { restaurantId } = await getCurrentUser()
    const { name, description } = body

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const restaurantManaged = await db.query.restaurant.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, restaurantId)
      },
    })
    if (!restaurantManaged) {
      throw new UnauthorizedError()
    }

    await db
      .update(restaurant)
      .set({ name, description })
      .where(eq(restaurant.id, restaurantId))
  },
  {
    body: t.Object({
      name: t.String(),
      description: t.String(),
    }),
  },
)
