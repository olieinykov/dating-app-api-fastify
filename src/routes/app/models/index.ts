import { FastifyInstance } from 'fastify'
import { getModelsByPreferences } from './handlers.js'
import { GetModelsByPreferencesSchema } from "./schemas.js";
import { userAuthenticated } from "../../../middleware/userAuthenticated.js";

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: GetModelsByPreferencesSchema,
    preHandler: [userAuthenticated],
    handler: getModelsByPreferences
  })
}

export default routes;