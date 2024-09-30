/* eslint-disable drizzle/enforce-delete-with-where */

import { faker } from '@faker-js/faker'
import {
  user,
  restaurant,
  order,
  orderItems,
  product,
  authLink,
} from './schema'
import { db } from './connection'
import chalk from 'chalk'
import { createId } from '@paralleldrive/cuid2'

// Not needed promise all because this is not on production, and is fast

await db.delete(authLink)
await db.delete(user)
await db.delete(restaurant)
await db.delete(order)
await db.delete(orderItems)
await db.delete(product)

console.log(chalk.yellow('✔️ Database cleared'))

const [customer1, customer2] = await db
  .insert(user)
  .values([
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
  ])
  .returning()

console.log(chalk.yellow('✔️ Customers inserted'))

const [manager] = await db
  .insert(user)
  .values([
    {
      name: faker.person.fullName(),
      email: 'admin@admin.com',
      role: 'manager',
    },
  ])
  .returning({
    id: user.id,
  })

const [restaurant1] = await db
  .insert(restaurant)
  .values([
    {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      managerId: manager.id,
    },
  ])
  .returning()

function generateProduct() {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    priceInCents: Number(faker.commerce.price({ min: 190, max: 490, dec: 0 })),
    restaurantId: restaurant1.id,
  }
}

console.log(chalk.yellow('✔️ Manager inserted'))

console.log(chalk.yellow('✔️ Restaurant inserted'))

const availableProducts = await db
  .insert(product)
  .values([generateProduct(), generateProduct(), generateProduct()])
  .returning()

console.log(chalk.yellow('✔️ Products inserted'))

type OrderItemsInsert = typeof orderItems.$inferInsert
type OrderInsert = typeof order.$inferInsert

const orderItemsToInsert: OrderItemsInsert[] = []
const ordersToInsert: OrderInsert[] = []

let totalInCents = 0

for (let i = 0; i < 200; i++) {
  const orderId = createId()

  const orderProducts = faker.helpers.arrayElements(availableProducts, {
    min: 1,
    max: 5,
  })

  for (const orderProduct of orderProducts) {
    const quantity = faker.number.int({ min: 1, max: 5 })

    totalInCents = orderProduct.priceInCents * quantity

    orderItemsToInsert.push({
      orderId,
      productId: orderProduct.id,
      priceInCents: orderProduct.priceInCents,
      quantity,
    })
  }

  ordersToInsert.push({
    id: orderId,
    customerId: faker.helpers.arrayElement([customer1.id, customer2.id]),
    restaurantId: restaurant1.id,
    totalInCents,
    status: faker.helpers.arrayElement([
      'pending',
      'delivered',
      'preparing',
      'delivering',
    ]),
    created_at: faker.date.recent({ days: 40 }),
  })
}

await db.insert(order).values(ordersToInsert)
await db.insert(orderItems).values(orderItemsToInsert)

console.log(chalk.greenBright(' ✔️ Orders created ✔️'))
console.log(chalk.greenBright(' ✔️ Seed finished ✔️'))

process.exit()
