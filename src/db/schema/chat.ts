import { pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const chats = pgTable('chat', {
    id: serial('id').primaryKey(),
    createdAt: timestamp('created_at',).defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});