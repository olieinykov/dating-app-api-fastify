import { integer, pgTable, serial, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { profiles } from './profile.js';
import { gifts } from './gift.js';
import { models } from './model.js';
import { tariffs } from './tariff.js';
import { chat_entries } from './chat_entry.js';

export const transactionOperationEnum = pgEnum('operation', [
  'gift',
  'balance',
  'tariff',
  'paid-chat-entry',
]);
export const transactionStatusEnum = pgEnum('status', [
  'pending',
  'completed',
  'failed',
  'pre-checkout',
]);

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  type: transactionOperationEnum('operation').notNull(),
  status: transactionStatusEnum('status').notNull(),
  profileId: integer('profile_id').references(() => profiles.id, { onDelete: 'cascade' }),
  giftId: integer('gift_id').references(() => gifts.id),
  chatEntryId: integer('chat_entry_id').references(() => chat_entries.id),
  modelId: integer('model_id').references(() => models.id),
  tariffId: integer('tariff_id').references(() => tariffs.id),
  tokensAmount: integer('tokens_amount'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
