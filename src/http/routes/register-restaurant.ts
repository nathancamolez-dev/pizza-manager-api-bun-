import Elysia, { t } from 'elysia'
import { db } from '../../db/connection'
import { user, restaurant } from '../../db/schema'

export const registerRestaurant = new Elysia().post(
  '/restaurants',
  async ({ body, set }) => {
    const { restaurantName, managerName, email } = body

    const [manager] = await db
      .insert(user)
      .values({
        name: managerName,
        email,
        role: 'manager',
      })
      .returning({
        id: user.id,
      })

    await db.insert(restaurant).values({
      name: restaurantName,
      managerId: manager.id,
    })

    set.status = 204
  },
  {
    body: t.Object({
      restaurantName: t.String(),
      managerName: t.String(),
      email: t.String(),
    }),
  },
)
