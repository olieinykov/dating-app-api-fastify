import { integer, pgTable, serial, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { chats } from './chat';
import { gifts } from './gift';

export const chatTypeEnum = pgEnum('message_type', ['text', 'gift']);

export const chat_entries = pgTable('chat_entries', {
  id: serial('id').primaryKey(),
  body: text('body'),
  chatId: integer('chat_id').references(() => chats.id, { onDelete: 'cascade' }),
  giftId: integer('gift_id').references(() => gifts.id),
  type: chatTypeEnum('type').notNull(),
  senderId: uuid('sender_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
