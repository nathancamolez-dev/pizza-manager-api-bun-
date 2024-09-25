import { createId } from '@paralleldrive/cuid2'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './users'

export const authLink = pgTable('auth_links', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  code: text('code').notNull().unique(),
  userId: text('user_id')
    .references(() => user.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
