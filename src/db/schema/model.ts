import { pgTable, text, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { uuid } from 'drizzle-orm/pg-core';
import {
  genderEnum,
  paramsBodyTypeEnum,
  paramsBustSizeEnum,
  paramsHairColorEnum,
} from './profile_preferences';

export const models = pgTable('models', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull().unique(),
  country: text('country').notNull(),
  description: text('description'),
  avatar: text('avatar'),
  age: integer('age').notNull(),
  gender: genderEnum('gender').notNull(),
  bustSize: paramsBustSizeEnum('bust_size').notNull(),
  hairColor: paramsHairColorEnum('hair_color').notNull(),
  bodyType: paramsBodyTypeEnum('body_type').notNull(),
  deactivatedAt: timestamp('deactivated_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastActiveTime: timestamp('last_active_time'),
});
