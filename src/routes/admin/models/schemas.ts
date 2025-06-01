import {Type, Static, Array, Object, String, Boolean, Integer} from '@sinclair/typebox'
import { PaginationSchema } from '../../../shared/schemas.js'

export const CreateModelSchema = {
  tags: ['Admin / Models'],
  body: Type.Object({
    name: Type.String({ minLength: 1 }),
    country: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    age: Type.Integer({ minimum: 1 }),
    gender: Type.Enum({
      male: 'male',
      female: 'female',
    }),  // тип enum для пола
    bustSize: Type.Enum({
      'AA-A': 'AA-A',
      'B-C': 'B-C',
      'D-E': 'D-E',
      'F+': 'F+',
    }),
    hairColor: Type.Enum({
      blonde: 'blonde',
      brunette: 'brunette',
      'brown-haired': 'brown-haired',
      redhead: 'redhead',
    }),
    bodyType: Type.Enum({
      athletic: 'athletic',
      curvy: 'curvy',
      slim: 'slim',
    }),
    photos: Array(
        Object({
          fileId: String(),
          isAvatar: Boolean(),
        }),
        { maxItems: 3 }
    ),
    favoriteGiftIds: Array(Integer())
  }),
};
export type CreateModelType = {
  Body: Static<typeof CreateModelSchema.body>;
};

export const UpdateModelSchema = {
  tags: ['Admin / Models'],
  parameters: Type.Object({
    modelId: Type.Integer(),
  }),
  body: Type.Partial(Type.Object({
    name: Type.String({ minLength: 1 }),
    geo: Type.String({ minLength: 1 }),
    avatar: Type.String({ format: 'uri' }),
    about: Type.String(),
    photos: Array(
        Object({
          fileId: String(),
          isAvatar: Boolean(),
        }),
        { maxItems: 3 }
    ),
  })),

};
export type UpdateModelType = {
  Body: Static<typeof UpdateModelSchema.body>;
  Params: Static<typeof UpdateModelSchema.parameters>;
};

export const GetAllModelsSchema = {
  tags: ['Admin / Models'],
  querystring: PaginationSchema,
}
export type GetAllModelsType = {
  Querystring: Static<typeof GetAllModelsSchema.querystring>;
}

export const GetOneModelSchema = {
  tags: ['Admin / Models'],
  parameters: Type.Object({
    modelId: Type.Integer(),
  }),
};
export type GetOneModelType = {
  Params: Static<typeof GetOneModelSchema.parameters>;
};

export const DeleteModelSchema = {
  tags: ['Admin / Models'],
  parameters: Type.Object({
    modelId: Type.Integer(),
  }),
};
export type DeleteModelType = {
  Params: Static<typeof DeleteModelSchema.parameters>;
};