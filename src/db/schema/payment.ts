import { integer, pgEnum, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';
import { profiles } from "./profile.js";
export const paymentStatusEnum = pgEnum('status', ['pending', 'completed', 'failed', 'pre-checkout']);

export const payments = pgTable('payments', {
    id: serial('id').primaryKey(),
    profileId: integer('profile_id').references(() => profiles.id),
    amount: integer('amount').notNull(),
    status: paymentStatusEnum('status').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});