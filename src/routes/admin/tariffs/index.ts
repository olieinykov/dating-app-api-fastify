import { FastifyInstance } from 'fastify'
import { getTariffs } from './handlers.js'
import { GetTariffsSchema } from './schemas.js'
import { adminAuthenticated } from "../../../middleware/adminAuthenticated.js";

const tariffsRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: GetTariffsSchema,
    preHandler: [adminAuthenticated],
    handler: getTariffs
  })
}

export default tariffsRoutes;