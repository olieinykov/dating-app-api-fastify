import { FastifyInstance } from 'fastify'
import { buyTokens, telegramPaymentWebhook } from './handlers.js'
import { BuyTokensSchema } from "./schemas.js";
import { userAuthenticated } from "../../../middleware/userAuthenticated.js";

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/buy-tokens', {
    schema: BuyTokensSchema,
    // preHandler: [userAuthenticated],
    handler: buyTokens
  })

  fastify.post('/telegram-payment-webhook', {
    handler: telegramPaymentWebhook
  })
}

export default routes;