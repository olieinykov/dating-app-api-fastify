import { FastifyInstance } from 'fastify'
import { register } from './handlers.js'
import { TelegramRegisterSchema } from './schemas.js'

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/', {
    handler: register,
    schema: TelegramRegisterSchema,
  })
}

export default routes;