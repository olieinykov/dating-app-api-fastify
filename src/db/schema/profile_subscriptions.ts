import { boolean, pgTable, serial, timestamp, unique } from 'drizzle-orm/pg-core';
import { profiles } from './profile';

export const profiles_subscriptions = pgTable(
  'profiles_subscription',
  {
    id: serial('id').primaryKey(),
    profileId: serial('profile_id').references(() => profiles.id, { onDelete: 'cascade' }),
    // lastTariffId: serial('tariff_id').references(() => tariffs.id, { onDelete: 'cascade' }),
    isTrial: boolean('is_trial').default(false),
    initiatedAt: timestamp('initiated_at').defaultNow(),
    prolongedAt: timestamp('prolonged_at'),
    expirationAt: timestamp('expiration_at'),
  },
  (table) => {
    const { profileId } = table;
    return {
      uniqProfile: unique('uniq_profile').on(profileId),
    };
  }
);
