import {
  Type,
  Static,
  Array,
  Object,
  String,
  Boolean,
  Integer,
  Optional,
} from '@sinclair/typebox';
import { PaginationSchema } from '../../../shared/schemas.js';

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
    }),
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
        id: String(),
        isAvatar: Boolean(),
      }),
      { maxItems: 3 }
    ),
    favoriteGiftIds: Array(Integer()),
    assignedChattersIds: Optional(Array(Integer())),
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
  body: Type.Partial(
    Type.Object({
      name: Type.String({ minLength: 1 }),
      geo: Type.String({ minLength: 1 }),
      avatar: Type.String({ format: 'uri' }),
      about: Type.String(),
      photos: Array(
        Object({
          id: String(),
          isAvatar: Boolean(),
        }),
        { maxItems: 3 }
      ),
      favoriteGiftIds: Array(Integer()),
      assignedChattersIds: Optional(Array(Integer())),
    })
  ),
};
export type UpdateModelType = {
  Body: Static<typeof UpdateModelSchema.body>;
  Params: Static<typeof UpdateModelSchema.parameters>;
};

export const GetAllModelsSchema = {
  tags: ['Admin / Models'],
  querystring: Type.Intersect([
    PaginationSchema,
    Type.Object({
      deactivated: Optional(Type.Boolean()),
    }),
  ]),
};
export type GetAllModelsType = {
  Querystring: Static<typeof GetAllModelsSchema.querystring>;
};

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

export const GetModelActionsSchema = {
  tags: ['Admin / Models'],
  querystring: Type.Intersect([
    PaginationSchema,
    Type.Object({
      modelId: Optional(Type.Integer()),
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

export type GetModelActionsType = {
  Querystring: Static<typeof GetModelActionsSchema.querystring>;
};

export const UpdateModelLastActiveTimeSchema = {
  tags: ['Admin / Models'],
  parameters: Type.Object({ modelId: Type.Integer() }),
};

export type UpdateModelLastActiveTimeType = {
  Params: Static<typeof UpdateModelLastActiveTimeSchema.parameters>;
};
