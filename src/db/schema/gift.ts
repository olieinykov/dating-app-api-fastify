import {pgTable, text, timestamp, serial, integer} from 'drizzle-orm/pg-core'

export const gifts = pgTable('gifts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  price: integer('price'),
  image: text('image'),
  deactivatedAt: timestamp('deactivated_at'),
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}) 