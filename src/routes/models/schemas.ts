import { Type, Static } from '@sinclair/typebox'
import { PaginationSchema } from '../../shared/schemas'

export const CreateModelSchema = {
  tags: ['Models'],
  body: Type.Object({
    name: Type.String({ minLength: 1 }),
    country: Type.String({ minLength: 1 }),
    avatar: Type.String({ format: 'uri' }),
    about: Type.String(),
    createdBy: Type.Integer({ minimum: 1 }),
  }),
};
export type CreateModelType = {
  Body: Static<typeof CreateModelSchema.body>;
};

export const UpdateModelSchema = {
  tags: ['Models'],
  parameters: Type.Object({
    modelId: Type.Integer(),
  }),
  body: Type.Partial(Type.Object({
    name: Type.String({ minLength: 1 }),
    geo: Type.String({ minLength: 1 }),
    avatar: Type.String({ format: 'uri' }),
    about: Type.String(),
  })),

};
export type UpdateModelType = {
  Body: Static<typeof UpdateModelSchema.body>;
  Params: Static<typeof UpdateModelSchema.parameters>;
};

export const GetAllModelsSchema = {
  tags: ['Models'],
  querystring: PaginationSchema,
}
export type GetAllModelsType = {
  Querystring: Static<typeof GetAllModelsSchema.querystring>;
}

export const GetOneModelSchema = {
  tags: ['Models'],
  parameters: Type.Object({
    modelId: Type.Integer(),
  }),
};
export type GetOneModelType = {
  Params: Static<typeof GetOneModelSchema.parameters>;
};

export const DeleteModelSchema = {
  tags: ['Models'],
  parameters: Type.Object({
    modelId: Type.Integer(),
  }),
};
export type DeleteModelType = {
  Params: Static<typeof DeleteModelSchema.parameters>;
};