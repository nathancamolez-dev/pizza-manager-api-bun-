import { createId } from '@paralleldrive/cuid2'
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role_enum', ['manager', 'customer'])

export const user = pgTable('users', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  role: userRoleEnum('role').default('customer').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})
