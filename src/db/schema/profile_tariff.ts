import { pgTable, serial, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { profiles } from './profile';
import { tariffs } from './tariff';

export const profiles_tariff = pgTable('profiles_tariff', {
  id: serial('id').primaryKey(),
  profileId: serial('profile_id').references(() => profiles.id),
  tariffId: serial('tariff_id').references(() => tariffs.id),
  entriesSentToday: integer('entries_sent_today').default(0),
  lastResetDate: timestamp('last_reset_date').defaultNow(),
  isActive: boolean('is_active').default(true),
  activatedAt: timestamp('activated_at').defaultNow(),
  deactivatedAt: timestamp('deactivated_at'),
});
