import { FastifyInstance } from 'fastify';
import { getModelsByPreferences, dislikeModel } from './handlers.js';
import { GetModelsByPreferencesSchema, DislikeModelSchema } from './schemas.js';
import { userAuthenticated } from '../../../middleware/userAuthenticated.js';
import { getOneModel } from '../../admin/models/handlers.js';
import { GetOneModelSchema } from '../../admin/models/schemas.js';

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: GetModelsByPreferencesSchema,
    preHandler: [userAuthenticated],
    handler: getModelsByPreferences,
  });
  fastify.get('/:modelId', {
    schema: GetOneModelSchema,
    preHandler: [userAuthenticated],
    handler: getOneModel,
  });
  fastify.post('/:modelId/dislike', {
    schema: DislikeModelSchema,
    preHandler: [userAuthenticated],
    handler: dislikeModel,
  });
};

export default routes;
