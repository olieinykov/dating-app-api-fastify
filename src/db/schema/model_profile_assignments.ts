import { pgTable, serial, integer, timestamp } from 'drizzle-orm/pg-core';
import { profiles } from './profile';
import { models } from './model';

export const model_profile_assignments = pgTable('model_profile_assignments', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  modelId: integer('model_id')
    .notNull()
    .references(() => models.id),
  createdAt: timestamp('created_at').defaultNow(),
});
