import { createId } from '@paralleldrive/cuid2'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { order } from './orders'
import { product } from './products'
import { relations } from 'drizzle-orm'

export const orderItems = pgTable('order_items', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  orderId: text('order_id')
    .references(() => order.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  productId: text('product_id')
    .references(() => product.id, {
      onDelete: 'set default',
    })
    .notNull(),
  quantity: integer('quantity').notNull(),
  priceInCents: integer('price_in_cents').notNull(),
})

export const OrderItemsRelations = relations(orderItems, ({ one }) => {
  return {
    order: one(order, {
      fields: [orderItems.orderId],
      references: [order.id],
      relationName: 'order_item_order',
    }),
    product: one(product, {
      fields: [orderItems.productId],
      references: [product.id],
      relationName: 'order_item_products',
    }),
  }
})
