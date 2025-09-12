import { pgTable, serial, integer, uuid, timestamp } from 'drizzle-orm/pg-core';
import { models } from './model';
import { actionTypeEnum } from './enum';

export const models_actions = pgTable('models_actions', {
  id: serial('id').primaryKey(),
  actorId: uuid('actor_id').notNull(),
  modelId: integer('model_id').references(() => models.id),
  actionType: actionTypeEnum('action_type').notNull(),
  actionTime: timestamp('action_time').defaultNow(),
});
