import { FastifyInstance } from 'fastify'
import { login, logout } from './handlers.js'
import { LoginSchema, LogoutSchema } from './schemas.js'

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/login', {
    schema: LoginSchema,
    handler: login
  })

  fastify.post('/logout', {
    schema: LogoutSchema,
    handler: logout
  })
}

export default authRoutes;