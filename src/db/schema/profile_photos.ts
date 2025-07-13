import { pgTable, serial } from 'drizzle-orm/pg-core';
import { profiles } from './profile.js';
import { uuid } from 'drizzle-orm/pg-core';
import { files } from './file.js';
import { boolean } from 'drizzle-orm/pg-core';

export const profiles_photos = pgTable('profiles_photos', {
  id: serial('id').primaryKey(),
  profileId: serial('profile_id').references(() => profiles.id),
  fileId: uuid('file_id')
    .references(() => files.id, { onDelete: 'cascade' })
    .notNull(),
  isAvatar: boolean('is_avatar'),
});