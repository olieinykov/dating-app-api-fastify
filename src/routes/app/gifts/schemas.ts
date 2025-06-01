import { Static, Type } from "@sinclair/typebox";

export const GetGiftsSchema = {
  tags: ['App / Gifts'],
}

export const GetModelFavoritesSchema = {
  tags: ['App / Gifts'],
  parameters: Type.Object({
    modelId: Type.Optional(Type.Integer()),
  }),
}
export type GetModelFavoritesSchemaType = {
  Params: Static<typeof GetModelFavoritesSchema.parameters>;
}

export const GetGiftsSentFromMeSchema = GetModelFavoritesSchema;
export type GetGiftsSentFromMeSchemaType = GetModelFavoritesSchemaType;

export const SendGiftsToModelSchema = {
  tags: ['App / Gifts'],
  body: Type.Object({
    giftId: Type.Optional(Type.Integer()),
    modelId: Type.Optional(Type.Integer()),
    chatId: Type.Optional(Type.Integer()),
    localEntryId: Type.String(),
  }),
}
export type SendGiftsToModelSchemaType = {
  Body: Static<typeof SendGiftsToModelSchema.body>;
}