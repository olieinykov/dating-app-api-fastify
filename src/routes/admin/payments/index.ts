import { FastifyInstance } from 'fastify'
import { getPayments } from './handlers.js'
import { GetPaymentsSchema } from './schemas.js'
import { adminAuthenticated } from "../../../middleware/adminAuthenticated.js";

const paymentsRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: GetPaymentsSchema,
    preHandler: [adminAuthenticated],
    handler: getPayments
  })
}

export default paymentsRoutes;