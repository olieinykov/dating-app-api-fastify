import { pgTable, serial, timestamp, integer } from 'drizzle-orm/pg-core'
import { profiles } from './profile.js'
import { models } from './model.js'
import { gifts } from './gift.js'

export const profile_gift_transactions = pgTable('profile_gift_transactions', {
    id: serial('id').primaryKey(),
    profileId: serial('profile_id').references(() => profiles.id),
    modelId: serial('model_id').references(() => models.id),
    giftId: serial('gift_id').references(() => gifts.id),
    price: integer('price').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});