import { pgTable, serial, varchar, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core'
import { profilesTelegram } from "./profile_telegram.js";
import { bigint } from "drizzle-orm/pg-core";

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id'),
  name: varchar('name', { length: 30 }),
  email: text('email').unique(),
  telegramId: integer('telegram_id').references(() => profilesTelegram.telegramId),
  role: text('role').notNull(),
  avatar: text('avatar'),
  activatedAt: timestamp('activated_at', { mode: 'date'} ),
  createdBy: bigint('created_by', { mode: 'number' }).references(() => profiles.id),
  bannedBy: bigint('deleted_by', { mode: 'number' }).references(() => profiles.id),
  bannedAt: timestamp('banned_at'),
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});