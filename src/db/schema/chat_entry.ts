import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { chats } from "./chat.js";
import {uuid} from "drizzle-orm/pg-core";
import {gifts} from "./gift.js";

export const chatTypeEnum = pgEnum("message_type", ["text", "gift"]);

export const chat_entries = pgTable('chat_entries', {
    id: serial('id').primaryKey(),
    body: text('body'),
    chatId: integer('chat_id').references(() => chats.id),
    giftId: integer('gift_id').references(() => gifts.id),
    type: chatTypeEnum("type").notNull(),
    senderId: uuid('sender_id').notNull(),
    createdAt: timestamp('created_at',).defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});