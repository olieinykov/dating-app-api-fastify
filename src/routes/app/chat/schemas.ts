import { Type, Static, Optional } from '@sinclair/typebox';

export const CreateChatSchema = {
  tags: ['Chat'],
  body: Type.Object({
    modelId: Type.Integer(),
  }),
};

export type CreateChatSchemaBodyType = {
  Body: Static<typeof CreateChatSchema.body>;
};

export const GetAllChatsSchema = {
  tags: ['Chat'],
  querystring: Type.Object({
    search: Type.Optional(Type.String()),
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    pageSize: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 50 })),
  }),
};
export type GetAllChatsSchemaType = {
  Querystring: Static<typeof GetChatEntriesSchema.querystring>;
};

export const GetTotalUnreadMessagesSchema = {
  tags: ['Chat'],
};

export const GetChatEntriesSchema = {
  tags: ['Chat'],
  parameters: Type.Object({
    chatId: Type.Integer(),
  }),
  querystring: Type.Object({
    fromModelId: Type.Optional(Type.String()),
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    pageSize: Type.Optional(Type.Integer({ minimum: 1, maximum: 1500, default: 50 })),
  }),
};

export type GetChatEntriesSchemaType = {
  Params: Static<typeof GetChatEntriesSchema.parameters>;
  Querystring: Static<typeof GetChatEntriesSchema.querystring>;
};

export const CreateChatEntrySchema = {
  tags: ['Chat'],
  parameters: Type.Object({
    chatId: Type.Integer(),
  }),
  body: Type.Object({
    body: Optional(Type.String()),
    attachmentIds: Optional(Type.Array(Type.String())),
    localEntryId: Type.String(),
    participantsIds: Type.Array(Type.String()),
  }),
};

export type CreateChatEntrySchemaType = {
  Body: Static<typeof CreateChatEntrySchema.body>;
  Params: Static<typeof CreateChatEntrySchema.parameters>;
};

export const ReadChatEntriesSchema = {
  tags: ['Chat'],
  body: Type.Object({
    entriesIds: Type.Array(Type.Integer()),
    participantId: Type.String(),
  }),
};

export type ReadChatEntriesSchemaType = {
  Body: Static<typeof ReadChatEntriesSchema.body>;
};
