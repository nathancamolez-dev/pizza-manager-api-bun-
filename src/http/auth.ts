import jwt from '@elysiajs/jwt'
import { env } from '../env'
import Elysia, { type Static, t } from 'elysia'
import { UnauthorizedError } from './errors/unauthorized-error'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const auth = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
  })
  .onError(({ set, error, code }) => {
    switch (code) {
      case 'UNAUTHORIZED':
        set.status = 401
        return { code, message: error.message }
    }
  })
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
          throw new UnauthorizedError()
        }

        return {
          userID: payload.sub,
          restaurantId: payload.restaurantId,
        }
      },
    }
  })
