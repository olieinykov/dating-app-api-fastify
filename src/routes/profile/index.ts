import { FastifyInstance } from 'fastify'
import {getProfile, activateProfile, updateProfile} from './handlers.js'
import {GetProfileSchema, ActivateProfileSchema, UpdateProfileSchema} from "./schemas.js";

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/:profileId', {
    schema: GetProfileSchema,
    handler: getProfile
  })

  fastify.put('/:profileId', {
    schema: UpdateProfileSchema,
    handler: updateProfile
  })

  fastify.post('/activate/:profileId', {
    schema: ActivateProfileSchema,
    handler: activateProfile
  })
}

export default routes;