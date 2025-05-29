import {Optional, Static, Type} from '@sinclair/typebox'
import { PaginationSchema } from '../../../shared/schemas.js'


export const GetModelsChatsSchema = {
  tags: ['Admin / Chat'],
  querystring: PaginationSchema,
  parameters: Type.Object({
    modelId: Type.Integer(),
  }),
}
export type GetAllModelsType = {
  Querystring: Static<typeof GetModelsChatsSchema.querystring>;
  Params: Static<typeof GetModelsChatsSchema.parameters>;
}

export const CreateChatEntrySchema = {
  tags: ['Admin / Chat'],
  parameters: Type.Object({
    chatId: Type.Integer(),
  }),
  body: Type.Object({
    body: Optional(Type.String()),
    attachmentIds: Optional(Type.Array(Type.String())),
    fromModelId: Type.String(),
    // participantId: Type.String(),
  })
}

export type CreateChatEntrySchemaType = {
  Body: Static<typeof CreateChatEntrySchema.body>;
  Params: Static<typeof CreateChatEntrySchema.parameters>;
}