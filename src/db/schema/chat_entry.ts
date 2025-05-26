import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profile";
import { models } from "./model";
import { pgEnum } from "drizzle-orm/pg-core";
import { chats } from "./chat.js";
import {uuid} from "drizzle-orm/pg-core";

export const chatTypeEnum = pgEnum("message_type", ["text"]);

export const chat_entries = pgTable('chat_entries', {
    id: serial('id').primaryKey(),
    body: text('body'),
    chatId: integer('chat_id').references(() => chats.id),
    type: chatTypeEnum("type").notNull(),
    senderId: uuid('sender_id').notNull(),
    createdAt: timestamp('created_at',).defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});