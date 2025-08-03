import { pgTable, serial, text, timestamp, bigint } from 'drizzle-orm/pg-core';

export const profilesTelegram = pgTable('profiles_telegram', {
  id: serial('id').primaryKey(),
  telegramId: bigint('telegram_id', { mode: 'number' }).unique(),
  telegramName: text('telegram_name'),
  clickId: text('click_id'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  languageCode: text('language_code'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
