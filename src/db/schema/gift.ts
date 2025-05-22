import {pgTable, text, timestamp, serial, integer, uuid} from 'drizzle-orm/pg-core'
import {files} from "./file";

export const gifts = pgTable('gifts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  price: integer('price'),
  avatarFileId: uuid('avatar_file_id')
      .references(() => files.id, { onDelete: 'cascade' }),
      // .notNull(),
  deactivatedAt: timestamp('deactivated_at'),
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}) 