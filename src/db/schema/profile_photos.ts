import { pgTable, serial, uuid, boolean } from 'drizzle-orm/pg-core';
import { profiles } from './profile.js';
import { files } from './file.js';

export const profiles_photos = pgTable('profiles_photos', {
  id: serial('id').primaryKey(),
  profileId: serial('profile_id').references(() => profiles.id, { onDelete: 'cascade' }),
  fileId: uuid('file_id')
    .references(() => files.id, { onDelete: 'cascade' })
    .notNull(),
  isAvatar: boolean('is_avatar'),
});
