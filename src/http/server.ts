import chalk from 'chalk'
import { Elysia } from 'elysia'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { logout } from './routes/logout'
import { getProfile } from './routes/get-profile'
import { getManagedRestaurant } from './routes/get-managed-restaurant'
import { getOrderDetails } from './routes/get-order-details'

const app = new Elysia()
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(logout)
  .use(getProfile)
  .use(getManagedRestaurant)
  .use(getOrderDetails)
  .onError(({ set, error, code }) => {
    switch (code) {
      case 'VALIDATION': {
        set.status = error.status
        return error.toResponse()
      }
      default: {
        set.status = 500
        console.error(error)
      }
    }
  })

app.listen(3333, () => {
  console.log(chalk.green('Server started on port 3333'))
})
