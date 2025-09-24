import { pgTable, serial, integer } from 'drizzle-orm/pg-core';
import { profiles, models } from './index.js';

export const disliked_models = pgTable('disliked_models', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  modelId: integer('model_id')
    .references(() => models.id)
    .notNull(),
});
