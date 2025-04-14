import { pgTable, bigint, text, timestamp, serial } from 'drizzle-orm/pg-core'
import { profiles } from './profile.js'

export const models = pgTable('models', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  description: text('description'),
  createdBy: bigint('created_by', { mode: 'number' })
    .notNull()
    .references(() => profiles.id),
  avatar: text('avatar'),
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});