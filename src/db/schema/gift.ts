import {pgTable, bigint, text, timestamp, serial, integer} from 'drizzle-orm/pg-core'
import { profiles } from './profile.js'

export const gifts = pgTable('gifts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  price: integer('price'),
  createdBy: bigint('created_by', { mode: 'number' })
    .notNull()
    .references(() => profiles.id),
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}) 