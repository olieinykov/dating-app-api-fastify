import { pgTable, serial, timestamp, integer } from 'drizzle-orm/pg-core';

export const tariffs = pgTable('tariffs', {
  id: serial('id').primaryKey(),
  price: integer('price').notNull(),
  daysPeriod: integer('days_period'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
