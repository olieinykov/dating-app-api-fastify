import {pgTable, bigint, text, timestamp, serial, integer, uuid} from 'drizzle-orm/pg-core'
import { profiles } from './profile.js'
import {files} from "./file.js";

export const gifts = pgTable('gifts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  price: integer('price'),
  imageId: uuid('image_id')
      .notNull()
      .references(() => files.id),
  createdBy: bigint('created_by', { mode: 'number' })
      .notNull()
      .references(() => profiles.id),
  deletedBy: bigint('deleted_by', { mode: 'number' })
      .references(() => profiles.id),
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}) 