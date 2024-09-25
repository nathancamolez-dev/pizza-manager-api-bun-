import Elysia, { t } from 'elysia'
import { db } from '../../db/connection'
import { createId } from '@paralleldrive/cuid2'
import { authLink } from '../../db/schema'
import { env } from '../../env'
import chalk from 'chalk'

export const sendAuthLink = new Elysia().post(
  '/authenticate',
  async ({ body }) => {
    const { email } = body

    const userFromEmail = await db.query.user.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })

    if (!userFromEmail) {
      throw new Error('User not found')
    }

    const authLinkCode = createId()

    await db.insert(authLink).values({
      code: authLinkCode,
      userId: userFromEmail.id,
    })

    const authLinkURL = new URL('/auth-links/authenticate', env.API_BASE_URL)

    authLinkURL.searchParams.set('code', authLinkCode)
    authLinkURL.searchParams.set('redirect', env.AUTH_REDIRECT_URL)

    console.log(chalk.magenta(authLinkURL.toString()))
  },
  {
    body: t.Object({
      email: t.String(),
    }),
  },
)
