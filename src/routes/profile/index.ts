import { FastifyInstance } from 'fastify'
import { getProfile, updateProfile } from './handlers.js'
import { GetProfileSchema, UpdateProfileSchema } from "./schemas.js";

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/:profileId', {
    schema: GetProfileSchema,
    handler: getProfile
  })

  fastify.put('/:profileId', {
    schema: UpdateProfileSchema,
    handler: updateProfile
  })
}

export default routes;