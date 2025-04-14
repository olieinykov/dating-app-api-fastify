import { FastifyInstance } from 'fastify'
import { login, logout } from './handlers.js'
import { LoginSchema, LogoutSchema } from './schemas.js'

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/logout', {
    handler: logout,
    schema: LogoutSchema,
  })

  fastify.post('/login', {
    schema: LoginSchema,
    handler: login
  })
}

export default authRoutes;