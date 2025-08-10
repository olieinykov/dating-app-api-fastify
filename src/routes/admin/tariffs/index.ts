import { FastifyInstance } from 'fastify';
import { getTariffs, createTariff, updateTariff, deleteTariff } from './handlers.js';
import {
  GetTariffsSchema,
  CreateTariffsSchema,
  UpdateTariffsSchema,
  DeleteTariffSchema,
} from './schemas.js';
import { adminAuthenticated } from '../../../middleware/adminAuthenticated.js';

const tariffsRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: GetTariffsSchema,
    preHandler: [adminAuthenticated],
    handler: getTariffs,
  });
  fastify.post('/', {
    schema: CreateTariffsSchema,
    preHandler: [adminAuthenticated],
    handler: createTariff,
  });
  fastify.put('/:tariffId', {
    schema: UpdateTariffsSchema,
    preHandler: [adminAuthenticated],
    handler: updateTariff,
  });
  fastify.delete('/:tariffId', {
    schema: DeleteTariffSchema,
    preHandler: [adminAuthenticated],
    handler: deleteTariff,
  });
};

export default tariffsRoutes;
