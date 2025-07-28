import { Static, Object, Integer } from '@sinclair/typebox';

export const GetTariffSchema = {
  tags: ['App / Tariff'],
};

export const BuyTariffSchema = {
  tags: ['App / Tariff'],
  body: Object({
    tariffId: Integer(),
  }),
};

export type BuyTariffSchemaType = {
  Body: Static<typeof BuyTariffSchema.body>;
};
