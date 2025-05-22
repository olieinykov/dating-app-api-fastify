import { FastifyInstance } from 'fastify'
import { getMe } from './handlers.js'
import { MeSchema } from './schemas.js'
import { adminAuthenticated } from "../../../middleware/adminAuthenticated";

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/me', {
    schema: MeSchema,
    preHandler: [adminAuthenticated],
    handler: getMe
  })
}

export default authRoutes;