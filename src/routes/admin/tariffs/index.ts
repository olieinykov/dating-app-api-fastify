import { FastifyInstance } from 'fastify';
import { getTariffs, createTariff, updateTariff } from './handlers.js';
import { GetTariffsSchema, CreateTariffsSchema, UpdateTariffsSchema } from './schemas.js';
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
};

export default tariffsRoutes;
