import { Optional, Static, Type } from '@sinclair/typebox';
import { PaginationSchema } from '../../../shared/schemas.js';

export const GetModelsChatsSchema = {
  tags: ['Admin / Chat'],
  querystring: PaginationSchema,
  parameters: Type.Object({
    modelId: Type.Integer(),
  }),
};
export type GetAllModelsType = {
  Querystring: Static<typeof GetModelsChatsSchema.querystring>;
  Params: Static<typeof GetModelsChatsSchema.parameters>;
};

export const CreateChatEntrySchema = {
  tags: ['Admin / Chat'],
  parameters: Type.Object({
    chatId: Type.Integer(),
  }),
  body: Type.Object({
    localEntryId: Type.String(),
    body: Optional(Type.String()),
    attachmentIds: Optional(Type.Array(Type.String())),
    fromModelId: Type.String(),
    participantsIds: Type.Array(Type.String()),
    telegramId: Type.Integer(),
  }),
};

export type CreateChatEntrySchemaType = {
  Body: Static<typeof CreateChatEntrySchema.body>;
  Params: Static<typeof CreateChatEntrySchema.parameters>;
};

export const GetChatModelsSchema = {
  tags: ['Admin / Chat'],
  querystring: PaginationSchema,
};

export type GetChatModelsSchemaType = {
  Querystring: Static<typeof GetChatModelsSchema.querystring>;
};

export const GetGiftsInChatSchema = {
  tags: ['Admin / Chat'],
  querystring: PaginationSchema,
  parameters: Type.Object({
    modelId: Type.Integer(),
    profileId: Type.Integer(),
  }),
};

export type GetGiftsInChatSchemaType = {
  Querystring: Static<typeof GetGiftsInChatSchema.querystring>;
  Params: Static<typeof GetGiftsInChatSchema.parameters>;
};
