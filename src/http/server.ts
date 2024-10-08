import chalk from 'chalk'
import { Elysia } from 'elysia'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { logout } from './routes/logout'
import { getProfile } from './routes/get-profile'
import { getManagedRestaurant } from './routes/get-managed-restaurant'
import { getOrderDetails } from './routes/get-order-details'
import { approveOrder } from './routes/approve-order'
import { dispatchOrder } from './routes/dispatch-order'
import { deliverOrder } from './routes/deliver-order'
import { cancelOrder } from './routes/cancel-order'
import { getOrders } from './routes/get-orders'
import { getMonthReceipt } from './routes/get-month-receipt'
import { getMonthOrderAmount } from './routes/get-month-orders-amount'
import { getDaysOrderAmount } from './routes/get-day-orders-amount'
import { getMonthCancelledOrderAmount } from './routes/get-cancelled-month-orders-amount'
import { getPopularProducts } from './routes/get-popular-products'
import { getDailyReceiptInPeriod } from './routes/get-daily-receipt-in-period'
import cors from '@elysiajs/cors'

const app = new Elysia()
  .use(
    cors({
      credentials: true,
      allowedHeaders: ['content-type'],
      methods: [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'OPTIONS',
        'PATCH',
        'HEAD',
        'TRACE',
      ],
      origin: (request): boolean => {
        const origin = request.headers.get('origin')
        if (!origin) {
          return false
        }
        return true
      },
    }),
  )
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(logout)
  .use(getProfile)
  .use(getManagedRestaurant)
  .use(getOrderDetails)
  .use(approveOrder)
  .use(dispatchOrder)
  .use(deliverOrder)
  .use(cancelOrder)
  .use(getOrders)
  .use(getMonthReceipt)
  .use(getDaysOrderAmount)
  .use(getMonthOrderAmount)
  .use(getMonthCancelledOrderAmount)
  .use(getPopularProducts)
  .use(getDailyReceiptInPeriod)
  .onError(({ set, error, code }) => {
    switch (code) {
      case 'VALIDATION': {
        set.status = error.status
        return error.toResponse()
      }
      case 'NOT_FOUND': {
        return new Response(null, { status: 404 })
      }
      default: {
        console.error(error)
        return new Response(null, { status: 500 })
      }
    }
  })

app.listen(3333, () => {
  console.log(chalk.green('Server started on port 3333'))
})
