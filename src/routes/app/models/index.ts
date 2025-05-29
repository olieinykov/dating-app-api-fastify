import { FastifyInstance } from 'fastify'
import { getModelsByPreferences } from './handlers.js'
import { GetModelsByPreferencesSchema } from "./schemas.js";
import { userAuthenticated } from "../../../middleware/userAuthenticated.js";
import { getOneModel } from "../../admin/models/handlers.js";
import { GetOneModelSchema } from "../../admin/models/schemas.js";

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: GetModelsByPreferencesSchema,
    preHandler: [userAuthenticated],
    handler: getModelsByPreferences
  })
  fastify.get('/:modelId', {
    schema: GetOneModelSchema,
    preHandler: [userAuthenticated],
    handler: getOneModel
  })
}

export default routes;