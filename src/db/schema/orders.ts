import { createId } from '@paralleldrive/cuid2'
import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './users'
import { restaurant } from './restaurant'
import { relations } from 'drizzle-orm'
import { orderItems } from './order-items'

export const orderStatusEnum = pgEnum('order_status_enum', [
  'pending',
  'preparing',
  'delivered',
  'delivering',
  'cancelled',
])

export const order = pgTable('orders', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  customerId: text('customer_id').references(() => user.id, {
    onDelete: 'set null',
  }),
  restaurantId: text('restaurant_id')
    .references(() => restaurant.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  status: orderStatusEnum('status').default('pending').notNull(),
  totalInCents: integer('total_in_cents').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
})

export const OrdersRelations = relations(order, ({ one, many }) => {
  return {
    customer: one(user, {
      fields: [order.customerId],
      references: [user.id],
      relationName: 'order_customer',
    }),
    restaurant: one(restaurant, {
      fields: [order.restaurantId],
      references: [restaurant.id],
      relationName: 'order_restaurant',
    }),
    orderItems: many(orderItems),
  }
})
