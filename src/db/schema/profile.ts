import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  uuid,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { profilesTelegram } from './profile_telegram.js';

export const userRoleEnum = pgEnum('role', ['admin', 'chatter', 'user']);
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id'),
  name: varchar('name', { length: 30 }),
  email: text('email').unique(),
  telegramId: integer('telegram_id').references(() => profilesTelegram.telegramId),
  // role: userRoleEnum('role'),
  role: text('role'),
  avatar: text('avatar'),
  activatedAt: timestamp('activated_at', { mode: 'date' }),
  deactivatedAt: timestamp('deactivated_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastActiveTime: timestamp('last_active_time'),
});
