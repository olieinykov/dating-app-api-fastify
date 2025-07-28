import { FastifyInstance } from 'fastify';
import { buyTariff, getTariffs } from './handlers.js';
import { BuyTariffSchema, GetTariffSchema } from './schemas.js';
import { userAuthenticated } from '../../../middleware/userAuthenticated.js';

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: GetTariffSchema,
    preHandler: [userAuthenticated],
    handler: getTariffs,
  });
  fastify.post('/buy', {
    schema: BuyTariffSchema,
    preHandler: [userAuthenticated],
    handler: buyTariff,
  });
};

export default routes;
