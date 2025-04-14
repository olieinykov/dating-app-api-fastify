import { Type, Static, Parameters } from '@sinclair/typebox'
import { PaginationSchema } from '../../shared/schemas.js'

export const CreateGiftSchema = {
  tags: ['Gifts'],
  body: Type.Object({
    title: Type.String({ minLength: 1}),
    price: Type.Number({ exclusiveMinimum: 0 }),
    image: Type.String({ format: 'uri' }),
    description: Type.String(),
    restrictedCountries: Type.Optional(Type.Array(Type.String())),
    isActive: Type.Boolean({ default: true }),
  }),
};
export type CreateGiftType = {
  Body: Static<typeof CreateGiftSchema.body>;
};

export const UpdateGiftSchema = {
  tags: ['Gifts'],
  parameters: Type.Object({
    giftId: Type.Integer(),
  }),
  body: Type.Partial(Type.Object({
    name: Type.String({ minLength: 1 }),
    price: Type.Number({ exclusiveMinimum: 0 }),
    image: Type.String({ format: 'uri' }),
    restrictedCountries: Type.Array(Type.String()),
    isActive: Type.Boolean({ default: true }),
  })),
};
export type UpdateGiftType = {
  Body: Static<typeof UpdateGiftSchema.body>;
  Params: Static<typeof UpdateGiftSchema.parameters>;
};

export const GetAllGiftsSchema = {
  tags: ['Gifts'],
  querystring: PaginationSchema,
}
export type GetAllGiftsType = {
  Querystring: Static<typeof GetAllGiftsSchema.querystring>
}

export const GetOneGiftSchema = {
  tags: ['Gifts'],
  parameters: Type.Object({
    giftId: Type.Integer(),
  }),
};
export type GetOneGiftType = {
  Params: Static<typeof GetOneGiftSchema.parameters>
};

export const DeleteGiftSchema = {
  tags: ['Gifts'],
  parameters: Type.Object({
    giftId: Type.Integer(),
  }),
};
export type DeleteGiftType = {
  Params: Static<typeof DeleteGiftSchema.parameters>
};