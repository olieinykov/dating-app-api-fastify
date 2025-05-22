import { pgTable, serial, integer } from 'drizzle-orm/pg-core'
import { uuid } from "drizzle-orm/pg-core";
import { models } from "./model";
import { actionTypeEnum } from "./gift_action";
import { timestamp } from "drizzle-orm/pg-core";

export const models_actions = pgTable('models_actions', {
  id: serial('id').primaryKey(),
  authorUserId: uuid('user_id').notNull(),
  actionModelId: integer('model_id').references(() => models.id),
  actionType: actionTypeEnum('action_type').notNull(),
  actionTime: timestamp('action_time',).defaultNow(),
});