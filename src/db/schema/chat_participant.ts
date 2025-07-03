import {
  integer,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { chats } from './chat';
import { uuid } from 'drizzle-orm/pg-core';

export const chat_participants = pgTable(
  'chat_participants',
  {
    id: serial('id').primaryKey(),
    chatId: integer('chat_id')
      .notNull()
      .references(() => chats.id),
    userId: uuid('user_id').notNull(),
    lastReadAt: timestamp('last_read_at'),
  },
  table => {
    const { chatId, userId } = table;
    return {
      uniqueChatParticipant: uniqueIndex('unique_chat_user').on(chatId, userId),
    };
  }
);
