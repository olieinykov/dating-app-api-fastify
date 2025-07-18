import { Type, Static, Optional } from '@sinclair/typebox';
import { PaginationSchema } from '../../../shared/schemas.js';

export const CreateGiftSchema = {
  tags: ['Admin / Gifts'],
  body: Type.Object({
    title: Type.String({ minLength: 1 }),
    price: Type.Number({ exclusiveMinimum: 0 }),
    image: Type.String(),
    createdBy: Type.Integer({ minimum: 1 }),
    restrictedCountries: Type.Optional(Type.Array(Type.String())),
    isActive: Type.Boolean({ default: true }),
  }),
};
export type CreateGiftType = {
  Body: Static<typeof CreateGiftSchema.body>;
};

export const UpdateGiftSchema = {
  tags: ['Admin / Gifts'],
  parameters: Type.Object({
    giftId: Type.Integer(),
  }),
  body: Type.Partial(
    Type.Object({
      name: Type.String({ minLength: 1 }),
      price: Type.Number({ exclusiveMinimum: 0 }),
      image: Type.String(),
      restrictedCountries: Type.Array(Type.String()),
      isActive: Type.Boolean({ default: true }),
    })
  ),
};
export type UpdateGiftType = {
  Body: Static<typeof UpdateGiftSchema.body>;
  Params: Static<typeof UpdateGiftSchema.parameters>;
};

export const GetAllGiftsSchema = {
  tags: ['Admin / Gifts'],
  querystring: PaginationSchema,
};
export type GetAllGiftsType = {
  Querystring: Static<typeof GetAllGiftsSchema.querystring>;
};

export const GetOneGiftSchema = {
  tags: ['Admin / Gifts'],
  parameters: Type.Object({
    giftId: Type.Integer(),
  }),
};
export type GetOneGiftType = {
  Params: Static<typeof GetOneGiftSchema.parameters>;
};

export const DeleteGiftSchema = {
  tags: ['Admin / Gifts'],
  parameters: Type.Object({
    giftId: Type.Integer(),
  }),
};
export type DeleteGiftType = {
  Params: Static<typeof DeleteGiftSchema.parameters>;
};

export const ActivateGiftSchema = {
  tags: ['Admin / Gifts'],
  parameters: Type.Object({
    giftId: Type.Integer(),
  }),
};
export type ActivateGiftType = {
  Params: Static<typeof ActivateGiftSchema.parameters>;
};

export const GetGiftActionsSchema = {
  tags: ['Admin /Gifts'],
  querystring: Type.Intersect([
    PaginationSchema,
    Type.Object({
      giftId: Optional(Type.Integer()),
      actionType: Optional(
        Type.Enum({
          create: 'create',
          edit: 'edit',
          delete: 'delete',
        })
      ),
      sortOrder: Optional(
        Type.Enum({
          asc: 'asc',
          desc: 'desc',
        })
      ),
    }),
  ]),
};

export type GetGiftActionsType = {
  Querystring: Static<typeof GetGiftActionsSchema.querystring>;
};
