import { FastifyInstance } from 'fastify'
import { me } from './handlers.js'
import { MeSchema } from "./schemas";

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: MeSchema,
    handler: me
  })
}

export default routes;