import { Integer, Object, Static, Type } from '@sinclair/typebox';
import { PaginationSchema } from '../../../shared/schemas';

export const GetTariffsSchema = {
  tags: ['Admin / Tariffs'],
  querystring: PaginationSchema,
};

export type GetTariffsSchemaType = {
  Querystring: Static<typeof GetTariffsSchema.querystring>;
};

export const CreateTariffsSchema = {
  tags: ['Admin / Tariffs'],
  body: Object({
    price: Integer({ minimum: 1 }),
    daysPeriod: Integer({ minimum: 1 }),
  }),
};

export type CreateTariffsSchemaType = {
  Body: Static<typeof CreateTariffsSchema.body>;
};

export const UpdateTariffsSchema = {
  tags: ['Admin / Tariffs'],
  parameters: Type.Object({
    tariffId: Type.Integer(),
  }),
  body: Object({
    price: Integer({ minimum: 1 }),
    daysPeriod: Integer({ minimum: 1 }),
  }),
};

export type UpdateTariffsSchemaType = {
  Body: Static<typeof CreateTariffsSchema.body>;
  Params: Static<typeof UpdateTariffsSchema.parameters>;
};

export const DeleteTariffSchema = {
  tags: ['Admin / Tariffs'],
  parameters: Type.Object({
    tariffId: Type.Integer(),
  }),
};

export type DeleteTariffSchemaType = {
  Params: Static<typeof DeleteTariffSchema.parameters>;
};
