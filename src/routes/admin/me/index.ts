import { FastifyInstance } from 'fastify'
import { getMe } from './handlers.js'
import { MeSchema } from './schemas.js'

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/me', {
    schema: MeSchema,
    handler: getMe
  })
}

export default authRoutes;