import { pgTable, serial, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { profiles } from './profile';
import { actionTypeEnum } from './enum';

export const profiles_actions = pgTable('profiles_actions', {
  id: serial('id').primaryKey(),
  actorId: uuid('actor_id').notNull(),
  profileId: integer('profile_id').references(() => profiles.id, { onDelete: 'cascade' }),
  actionType: actionTypeEnum('action_type').notNull(),
  actionTime: timestamp('action_time').defaultNow(),
});
