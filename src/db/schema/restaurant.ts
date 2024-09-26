import { createId } from '@paralleldrive/cuid2'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './users'
import { relations } from 'drizzle-orm'
import { order } from './orders'
import { product } from './products'

export const restaurant = pgTable('restaurants', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  managerId: text('manager_id').references(() => user.id, {
    onDelete: 'set null',
  }),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

export const restaurantsRelations = relations(restaurant, ({ one, many }) => {
  return {
    manager: one(user, {
      fields: [restaurant.managerId],
      references: [user.id],
      relationName: 'restaurant_manager',
    }),
    orders: many(order),
    products: many(product),
  }
})
