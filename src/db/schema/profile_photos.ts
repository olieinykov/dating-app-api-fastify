import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core'
import { profiles } from "./profile.js";

export const profilesPhotos = pgTable('profiles_photos', {
  id: serial('id').primaryKey(),
  profileId: serial('profile_id').references(() => profiles.id),
  url: text('url').notNull(),
  order: integer('order').notNull(),
});