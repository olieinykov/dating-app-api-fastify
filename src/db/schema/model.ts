import { pgTable, bigint, text, timestamp, serial, integer } from 'drizzle-orm/pg-core'
import { profiles } from './profile.js'
import { uuid } from "drizzle-orm/pg-core";
import { genderEnum, paramsBodyTypeEnum, paramsBustSizeEnum, paramsHairColorEnum } from "./profile_preferences.js";

export const models = pgTable('models', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  avatar: text('avatar'),
  description: text('description'),
  age: integer('age').notNull(),
  gender: genderEnum('gender').notNull(),
  bustSize: paramsBustSizeEnum('bust_size').notNull(),
  hairColor: paramsHairColorEnum('hair_color').notNull(),
  bodyType: paramsBodyTypeEnum('body_type').notNull(),
  createdBy: bigint('created_by', { mode: 'number' })
    .notNull()
    .references(() => profiles.id),
  deletedBy: bigint('deleted_by', { mode: 'number' })
      .references(() => profiles.id),
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});