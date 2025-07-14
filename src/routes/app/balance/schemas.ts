import { Static, Object, Integer } from '@sinclair/typebox';

export const BuyTokensSchema = {
  tags: ['App / Balance'],
  body: Object({
    amount: Integer({ minimum: 1, maximum: 10000 }),
  }),
};

export type BuyTokensSchemaType = {
  Body: Static<typeof BuyTokensSchema.body>;
};
