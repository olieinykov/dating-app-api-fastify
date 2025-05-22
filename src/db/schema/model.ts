import { pgTable, text, timestamp, serial, integer } from 'drizzle-orm/pg-core'
import { uuid } from "drizzle-orm/pg-core";
import { genderEnum, paramsBodyTypeEnum, paramsBustSizeEnum, paramsHairColorEnum } from "./profile_preferences";
import { files } from "./file";

export const models = pgTable('models', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  avatarFileId: uuid('avatar_file_id')
      .references(() => files.id, { onDelete: 'cascade' })
      .notNull(),
  description: text('description'),
  age: integer('age').notNull(),
  gender: genderEnum('gender').notNull(),
  bustSize: paramsBustSizeEnum('bust_size').notNull(),
  hairColor: paramsHairColorEnum('hair_color').notNull(),
  bodyType: paramsBodyTypeEnum('body_type').notNull(),
  deactivatedAt: timestamp('deactivated_at'),
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});