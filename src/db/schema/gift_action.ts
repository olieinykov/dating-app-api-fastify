import { pgTable, serial, integer } from 'drizzle-orm/pg-core'
import { uuid } from "drizzle-orm/pg-core";
import { gifts } from "./gift.js";
import { pgEnum } from "drizzle-orm/pg-core";
import {timestamp} from "drizzle-orm/pg-core";
export const actionTypeEnum = pgEnum('action_type', ['create', 'edit', 'delete']);

export const gift_actions = pgTable('gift_actions', {
  id: serial('id').primaryKey(),
  authorUserId: uuid('user_id').notNull(),
  actionGiftId: integer('gift_id').references(() => gifts.id),
  actionType: actionTypeEnum('action_type').notNull(),
  actionTime: timestamp('action_time',).defaultNow(),
});