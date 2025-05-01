import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { chat_entries } from "./chat_entry";
import { text } from "drizzle-orm/pg-core";

export const chats = pgTable('chat', {
    id: serial('id').primaryKey(),
    lastChannelEntryId: integer('last_channel_entry_id').references(() => chat_entries.id),
    modelId: text('model_id'),
    profileId: text('profile_id'),
    createdAt: timestamp('created_at',).defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});