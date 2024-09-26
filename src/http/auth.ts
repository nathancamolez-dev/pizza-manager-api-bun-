import jwt from '@elysiajs/jwt'
import { env } from '../env'
import Elysia, { type Static, t } from 'elysia'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const auth = new Elysia()
  .use(
    jwt({
      secret: env.JWT_SECRET,
      schema: jwtPayload,
    }),
  )
  .derive({ as: 'scoped' }, ({ jwt, cookie: { auth } }) => {
    return {
      signUser: async (payload: Static<typeof jwtPayload>) => {
        const token = await jwt.sign(payload)

        auth.value = token
        auth.httpOnly = true
        auth.maxAge = 60 * 60 * 24 * 7 // 7 days
        auth.path = '/'
      },

      signOut: async () => {
        auth.remove()
      },
      getCurrentUser: async () => {
        const payload = await jwt.verify(auth.value)

        if (!payload) {
          throw new Error('Unauthorized')
        }

        return {
          userID: payload.sub,
          restaurantId: payload.restaurantId,
        }
      },
    }
  })
