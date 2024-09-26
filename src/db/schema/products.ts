import { createId } from '@paralleldrive/cuid2'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { restaurant } from './restaurant'
import { relations } from 'drizzle-orm'
import { orderItems } from './order-items'

export const product = pgTable('products', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  priceInCents: integer('price_in_cents').notNull(),
  restaurantId: text('restaurant_id')
    .references(() => restaurant.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

export const ProductsRelations = relations(product, ({ one, many }) => {
  return {
    restaurant: one(restaurant, {
      fields: [product.restaurantId],
      references: [restaurant.id],
      relationName: 'product_restaurant',
    }),
    orderItems: many(orderItems),
  }
})
