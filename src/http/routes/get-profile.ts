import Elysia from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getProfile = new Elysia()
  .use(auth)
  .get('/me', async ({ getCurrentUser }) => {
    const { userID } = await getCurrentUser()

    const user = await db.query.user.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userID)
      },
    })

    if (!user) {
      throw new UnauthorizedError()
    }

    return user
  })
