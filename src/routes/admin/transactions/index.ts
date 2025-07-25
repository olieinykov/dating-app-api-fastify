import { FastifyInstance } from 'fastify';
import { getTransactions } from './handlers.js';
import { GetTransactionSchema } from './schemas.js';
import { adminAuthenticated } from '../../../middleware/adminAuthenticated.js';

const transactionsRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: GetTransactionSchema,
    preHandler: [adminAuthenticated],
    handler: getTransactions,
  });
};

export default transactionsRoutes;
