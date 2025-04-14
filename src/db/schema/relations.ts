import { relations } from 'drizzle-orm'
import { profiles } from './profile'
import { models } from './model'
import { gifts } from './gift'
import { modelGifts } from './model-gift'

export const profilesRelations = relations(profiles, ({ many }) => ({
  models: many(models),
  gifts: many(gifts)
}))

export const modelsRelations = relations(models, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [models.createdBy],
    references: [profiles.id]
  }),
  modelGifts: many(modelGifts)
}))

export const giftsRelations = relations(gifts, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [gifts.createdBy],
    references: [profiles.id]
  }),
  modelGifts: many(modelGifts)
}))

export const modelGiftsRelations = relations(modelGifts, ({ one }) => ({
  model: one(models, {
    fields: [modelGifts.modelId],
    references: [models.id]
  }),
  gift: one(gifts, {
    fields: [modelGifts.giftId],
    references: [gifts.id]
  })
})) 