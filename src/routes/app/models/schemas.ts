import { Static, Type } from '@sinclair/typebox';

export const GetModelsByPreferencesSchema = {
  tags: ['App / Models'],
  querystring: Type.Object({
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    pageSize: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),
  }),
};
export type GetModelsByPreferencesSchemaType = {
  Querystring: Static<typeof GetModelsByPreferencesSchema.querystring>;
};
