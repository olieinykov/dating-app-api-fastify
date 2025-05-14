import {pgTable, bigint, text, timestamp, serial, integer, uuid} from 'drizzle-orm/pg-core'
import { profiles } from './profile'
import {files} from "./file";

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
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}) 