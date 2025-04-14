import { Type, Static } from '@sinclair/typebox'

export const TelegramRegisterSchema = {
  tags: ['Telegram'],
  body: Type.Object({
    telegramId: Type.Integer(),
    telegramName: Type.Optional(Type.String()),
    clickId: Type.Optional(Type.String()),
    firstName: Type.Optional(Type.String()),
    lastName: Type.Optional(Type.String()),
    languageCode: Type.Optional(Type.String())
  })
}

export type TelegramRegisterSchemaBodyType = {
  Body: Static<typeof TelegramRegisterSchema.body>
}
