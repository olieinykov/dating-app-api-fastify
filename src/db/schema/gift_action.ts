import { pgTable, serial, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { gifts } from './gift.js';
import { actionTypeEnum } from './enum.js';

export const gifts_actions = pgTable('gifts_actions', {
  id: serial('id').primaryKey(),
  actorId: uuid('actor_id').notNull(),
  giftId: integer('gift_id').references(() => gifts.id),
  actionType: actionTypeEnum('action_type').notNull(),
  actionTime: timestamp('action_time').defaultNow(),
});
