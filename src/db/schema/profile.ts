import { pgTable, serial, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id'),
  email: text('email').unique(),
  telegramId: integer('telegram_id').unique(),
  telegramName: text('telegram_name'),
  clickId: text('click_id'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: text('role').notNull(),
  avatar: text('avatar'),
  about: text('about'),
  bannedAt: timestamp('banned_at'),
  country: text('country'),
  city: text('city'),
  languageCode: text('language_code'),
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});