import { FastifyInstance } from 'fastify'
import { login, register, activateProfile } from './handlers.js'
import { ActivateProfileSchema, LoginSchema, RegisterSchema } from './schemas.js'

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/login', {
    schema: LoginSchema,
    handler: login
  })

  fastify.post('/register', {
    schema: RegisterSchema,
    handler: register
  })

  fastify.post('/activate/:profileId', {
    schema: ActivateProfileSchema,
    handler: activateProfile
  })
}

export default authRoutes;