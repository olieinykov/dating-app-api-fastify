import { pgTable, timestamp, integer, serial } from 'drizzle-orm/pg-core';
import { profiles } from './profile';

export const profile_balances = pgTable('profile_balances', {
  profileId: serial('profile_id').references(() => profiles.id),
  balance: integer('balance').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});
