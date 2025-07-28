import { pgTable, serial, uuid, boolean } from 'drizzle-orm/pg-core';
import { profiles } from './profile';
import { files } from './file';

export const profiles_photos = pgTable('profiles_photos', {
  id: serial('id').primaryKey(),
  profileId: serial('profile_id').references(() => profiles.id),
  fileId: uuid('file_id')
    .references(() => files.id, { onDelete: 'cascade' })
    .notNull(),
  isAvatar: boolean('is_avatar'),
});
