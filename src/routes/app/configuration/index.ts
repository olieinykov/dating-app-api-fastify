import { FastifyInstance } from 'fastify'
import { getConfiguration } from './handlers.js'
import { GetConfigurationSchema } from "./schemas.js";
import { userAuthenticated } from "../../../middleware/userAuthenticated.js";

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: GetConfigurationSchema,
    preHandler: [userAuthenticated],
    handler: getConfiguration
  })
}

export default routes;