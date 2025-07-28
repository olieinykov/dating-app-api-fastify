import { FastifyInstance } from 'fastify';
import { activateProfile, createOrLogin, logout } from './handlers.js';
import { ActivateProfileSchema } from './schemas.js';
import { userAuthenticated } from '../../../middleware/userAuthenticated.js';

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/login', {
    handler: createOrLogin,
  });

  fastify.post('/activate/:profileId', {
    schema: ActivateProfileSchema,
    handler: activateProfile,
  });
  fastify.post('/logout', {
    preHandler: [userAuthenticated(true)],
    handler: logout,
  });
};

export default authRoutes;
