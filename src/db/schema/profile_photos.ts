import { pgTable, serial, integer } from 'drizzle-orm/pg-core'
import { profiles } from "./profile.js";
import {uuid} from "drizzle-orm/pg-core";
import {files} from "./file.js";

export const profilesPhotos = pgTable('profiles_photos', {
  id: serial('id').primaryKey(),
  profileId: serial('profile_id').references(() => profiles.id),
  fileId: uuid('file_id')
      .references(() => files.id, { onDelete: 'cascade' })
      .notNull(),
  order: integer('order').notNull(),
});