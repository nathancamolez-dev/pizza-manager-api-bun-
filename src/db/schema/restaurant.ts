
import { createId } from "@paralleldrive/cuid2";
import {  pgTable , text, timestamp } from "drizzle-orm/pg-core";



export const restaurant = pgTable("restaurants", {
  id: text("id").$defaultFn(() => createId()).primaryKey( ),
  name: text("name").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").notNull().defaultNow(), 
  updated_at: timestamp("updated_at").notNull().defaultNow(),
})