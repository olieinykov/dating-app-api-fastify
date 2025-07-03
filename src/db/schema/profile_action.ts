import { pgTable, serial, integer } from 'drizzle-orm/pg-core';
import { uuid, timestamp } from 'drizzle-orm/pg-core';
import { profiles } from './profile.js';
import { actionTypeEnum } from './enum.js';

export const profiles_actions = pgTable('profiles_actions', {
  id: serial('id').primaryKey(),
  actorId: uuid('actor_id').notNull(),
  profileId: integer('profile_id').references(() => profiles.id),
  actionType: actionTypeEnum('action_type').notNull(),
  actionTime: timestamp('action_time').defaultNow(),
});
