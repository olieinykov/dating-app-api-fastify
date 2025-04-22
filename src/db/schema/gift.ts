import {pgTable, bigint, text, timestamp, serial, integer} from 'drizzle-orm/pg-core'
import { profiles } from './profile.js'

export const gifts = pgTable('gifts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  price: integer('price'),
  image: integer('image'),
  createdBy: bigint('created_by', { mode: 'number' })
    .notNull()
    .references(() => profiles.id),
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}) 