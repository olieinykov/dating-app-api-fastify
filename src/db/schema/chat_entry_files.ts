import { integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { chat_entries } from './chat_entry.js';
import { files } from './file.js';

export const chat_entry_files = pgTable(
  'chat_entry_files',
  {
    chatEntryId: integer('chat_entry_id')
      .references(() => chat_entries.id, { onDelete: 'cascade' })
      .notNull(),
    fileId: uuid('file_id')
      .references(() => files.id, { onDelete: 'cascade' })
      .notNull(),
  },
  t => ({
    pk: primaryKey({ columns: [t.chatEntryId, t.fileId] }),
  })
);
