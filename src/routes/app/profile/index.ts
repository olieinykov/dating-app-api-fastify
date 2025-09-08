import { FastifyInstance } from 'fastify';
import {getProfile, updateProfile, updateProfileActivity} from './handlers.js';
import { GetProfileSchema, UpdateProfileSchema } from './schemas.js';
import { userAuthenticated } from '../../../middleware/userAuthenticated.js';

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: GetProfileSchema,
    preHandler: [userAuthenticated(true)],
    handler: getProfile,
  });

  fastify.put('/', {
    schema: UpdateProfileSchema,
    preHandler: [userAuthenticated(true)],
    handler: updateProfile,
  });

  fastify.post('/last-activity', {
    schema: GetProfileSchema,
    preHandler: [userAuthenticated(true)],
    handler: updateProfileActivity,
  });
};

export default routes;
