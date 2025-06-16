import { pgTable, serial, integer } from 'drizzle-orm/pg-core'
import { uuid, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
export const actionTypeEnum = pgEnum('action_type', ['create', 'edit', 'delete']);

export const profile_actions = pgTable('profile_actions', {
  id: serial('id').primaryKey(),
  authorUserId: uuid('profile_id').notNull(),
  actionProfileId: integer('gift_id').references(() => profiles.id),
  actionType: actionTypeEnum('action_type').notNull(),
  actionTime: timestamp('action_time',).defaultNow(),
});