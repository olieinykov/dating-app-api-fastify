import { FastifyInstance } from 'fastify'
import { getProfile, updateProfile } from './handlers.js'
import { GetProfileSchema, UpdateProfileSchema } from "./schemas.js";
import { userAuthenticated } from "../../../middleware/userAuthenticated.js";

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: GetProfileSchema,
    preHandler: [userAuthenticated],
    handler: getProfile
  })

  fastify.put('/', {
    schema: UpdateProfileSchema,
    preHandler: [userAuthenticated],
    handler: updateProfile
  })
}

export default routes;