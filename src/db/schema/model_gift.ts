import { pgTable, bigint, serial } from 'drizzle-orm/pg-core';
import { models } from './model.js';
import { gifts } from './gift.js';

export const model_gifts = pgTable('model_gifts', {
  id: serial('id').primaryKey(),
  modelId: bigint('model_id', { mode: 'number' })
    .notNull()
    .references(() => models.id),
  giftId: bigint('gift_id', { mode: 'number' })
    .notNull()
    .references(() => gifts.id),
});
