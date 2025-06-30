import { FastifyInstance } from 'fastify'
import { setupTelegramHooks } from './handlers.js'
import { SetupTelegramHooksSchema } from './schemas.js'

const telegramRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/setup-hooks', {
    schema: SetupTelegramHooksSchema,
    // preHandler: [adminAuthenticated],
    handler: setupTelegramHooks
  })
}

export default telegramRoutes;