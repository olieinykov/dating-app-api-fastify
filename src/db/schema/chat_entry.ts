import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profile.js";
import { models } from "./model.js";
import { pgEnum } from "drizzle-orm/pg-core";
import { chats } from "./chat.js";

export const chatTypeEnum = pgEnum("message_type", ["text"]);

export const chat_entries = pgTable('chat_entries', {
    id: serial('id').primaryKey(),
    body: text('body'),
    chatId: integer('chat_id').references(() => chats.id),
    type: chatTypeEnum("type").notNull(),
    profileId: integer('profiles_id').references(() => profiles.id),
    modelId: integer('model_id').references(() => models.id),
    createdAt: timestamp('created_at',).defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});