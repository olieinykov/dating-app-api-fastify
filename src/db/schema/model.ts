import {pgTable, bigint, text, timestamp, serial, integer} from 'drizzle-orm/pg-core'
import { profiles } from './profile'
import { uuid } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";

export const genderEnum = pgEnum('gender', ['male', 'female']);
export const bustSizeEnum = pgEnum('params_bust_size', ['AA-A', 'B-C', 'D-E', 'F+']);
export const hairColorEnum = pgEnum('params_hair_color', ['blonde', 'brunette', 'brown-haired', 'redhead']);
export const bodyTypeEnum = pgEnum('params_body_type', ['athletic', 'curvy', 'slim']);

export const models = pgTable('models', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id'),
  name: text('name').notNull(),
  country: text('country').notNull(),
  avatar: text('avatar'),
  description: text('description'),
  age: integer('age').notNull(),
  gender: genderEnum('gender').notNull(),
  bustSize: bustSizeEnum('bust_size').notNull(),
  hairColor: hairColorEnum('hair_color').notNull(),
  bodyType: bodyTypeEnum('body_type').notNull(),
  createdBy: bigint('created_by', { mode: 'number' })
    .notNull()
    .references(() => profiles.id),
  deletedBy: bigint('deleted_by', { mode: 'number' })
      .references(() => profiles.id),
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});