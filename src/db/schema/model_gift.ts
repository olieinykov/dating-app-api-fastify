import { pgTable, bigint } from 'drizzle-orm/pg-core'
import { models } from './model.js'
import { gifts } from './gift.js'

export const modelGifts = pgTable('model_gifts', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  modelId: bigint('model_id', { mode: 'number' })
    .notNull()
    .references(() => models.id),
  giftId: bigint('gift_id', { mode: 'number' })
    .notNull()
    .references(() => gifts.id)
}) 