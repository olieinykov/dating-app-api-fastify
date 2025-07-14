import { pgTable, serial, timestamp, boolean, text, integer } from 'drizzle-orm/pg-core';
export const tariffs = pgTable('tariffs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  description: text('description'),
  entriesDailyLimit: integer('entries_daily_limit').default(50),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
