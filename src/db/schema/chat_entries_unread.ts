import { pgTable, uuid, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { chat_entries } from "./chat_entry.js";
import { chats } from "./chat.js";

export const chat_entries_unread = pgTable("chat_entries_unread", {
    userId: uuid("user_id").notNull(),
    chatId: integer('chat_id').references(() => chats.id),
    chatEntryId: integer('chat_entry_id')
        .references(() => chat_entries.id, { onDelete: 'cascade' })
        .notNull(),
    readAt: timestamp("read_at").defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.chatEntryId] }),
}));