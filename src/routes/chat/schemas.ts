import { Type, Static } from '@sinclair/typebox'

export const CreateChatSchema = {
  tags: ['Chat'],
  body: Type.Object({
    modelId: Type.Integer(),
    profileId: Type.Integer(),
  })
}

export type CreateChatSchemaBodyType = {
  Body: Static<typeof CreateChatSchema.body>
}

export const GetChatEntriesSchema = {
  tags: ['Chat'],
  parameters: Type.Object({
    chatId: Type.Integer(),
  }),

}

export type GetChatEntriesSchemaType = {
  Params: Static<typeof GetChatEntriesSchema.parameters>
}
