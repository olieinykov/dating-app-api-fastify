import { PaginationSchema } from '../../../shared/schemas.js';
import { Static, Type, Optional } from '@sinclair/typebox';

export const GetTransactionSchema = {
  tags: ['Admin / Transactions'],
  querystring: Type.Intersect([
    PaginationSchema,
    Type.Object({
      status: Optional(Type.String()),
    }),
  ]),
};

export type GetTransactionSchemaType = {
  Querystring: Static<typeof GetTransactionSchema.querystring>;
};
