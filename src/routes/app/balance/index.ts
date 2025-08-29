import { FastifyInstance } from 'fastify';
import { buyTokens, telegramPaymentWebhook, getBalance } from './handlers.js';
import { BuyTokensSchema, GetBalanceSchema } from './schemas.js';
import { userAuthenticated } from '../../../middleware/userAuthenticated.js';

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: GetBalanceSchema,
    preHandler: [userAuthenticated(true)],
    handler: getBalance,
  });

  fastify.post('/buy-tokens', {
    schema: BuyTokensSchema,
    preHandler: [userAuthenticated(true)],
    handler: buyTokens,
  });

  fastify.post('/telegram-payment-webhook', {
    handler: telegramPaymentWebhook,
  });
};

export default routes;
