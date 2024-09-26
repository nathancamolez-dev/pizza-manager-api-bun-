import Elysia from 'elysia'
import { auth } from '../auth'

export const logout = new Elysia()
  .use(auth)
  .post('/sign-out', async ({ signOut }) => {
    signOut()
  })
