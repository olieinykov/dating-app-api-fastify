import { pgTable, serial, varchar, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core'
import { profilesTelegram } from "./profile_telegram.js";

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id'),
  name: varchar('name', { length: 30 }),
  email: text('email').unique(),
  telegramId: integer('telegram_id').references(() => profilesTelegram.id),
  role: text('role').notNull(),
  avatar: text('avatar'),
  bannedAt: timestamp('banned_at'),
  activatedAt: timestamp('activated_at', { mode: 'date'} ),
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});