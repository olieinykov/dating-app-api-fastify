import { PaginationSchema } from "../../../shared/schemas.js";
import {Static} from "@sinclair/typebox";

export const GetTransactionSchema = {
  tags: ['Admin / Transactions'],
  querystring: PaginationSchema,
};

export type GetTransactionSchemaType = {
  Querystring: Static<typeof GetTransactionSchema.querystring>;
};
