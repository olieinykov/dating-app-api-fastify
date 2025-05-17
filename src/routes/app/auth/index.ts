import { FastifyInstance } from 'fastify'
import { activateProfile, createOrLogin } from './handlers.js'
import { ActivateProfileSchema, LoginSchema } from './schemas.js'

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/login', {
    // schema: LoginSchema,
    handler: createOrLogin
  })

  fastify.post('/activate/:profileId', {
    schema: ActivateProfileSchema,
    handler: activateProfile
  })
}

export default authRoutes;