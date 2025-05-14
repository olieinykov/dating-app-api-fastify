import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profile";

export const chats = pgTable('chat', {
    id: serial('id').primaryKey(),
    profileId: integer('profile_id').references(() => profiles.id),
    createdAt: timestamp('created_at',).defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});