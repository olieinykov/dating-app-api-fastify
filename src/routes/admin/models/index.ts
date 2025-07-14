import { FastifyInstance } from 'fastify';
import {
  getAllModels,
  getOneModel,
  deleteModel,
  activateModel,
  createModel,
  updateModel,
  getModelActions,
  updateModelLastActiveTime,
} from './handlers.js';
import {
  CreateModelSchema,
  GetAllModelsSchema,
  DeleteModelSchema,
  ActivateModelSchema,
  UpdateModelSchema,
  GetOneModelSchema,
  GetModelActionsSchema,
  UpdateModelLastActiveTimeSchema,
} from './schemas.js';
import { adminAuthenticated } from '../../../middleware/adminAuthenticated.js';

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/', {
    schema: CreateModelSchema,
    preHandler: [adminAuthenticated],
    handler: createModel,
  });
  fastify.put('/:modelId', {
    schema: UpdateModelSchema,
    preHandler: [adminAuthenticated],
    handler: updateModel,
  });
  fastify.get('/', {
    schema: GetAllModelsSchema,
    preHandler: [adminAuthenticated],
    handler: getAllModels,
  });
  fastify.get('/:modelId', {
    schema: GetOneModelSchema,
    preHandler: [adminAuthenticated],
    handler: getOneModel,
  });
  fastify.delete('/:modelId', {
    schema: DeleteModelSchema,
    preHandler: [adminAuthenticated],
    handler: deleteModel,
  });
  fastify.patch('/:modelId', {
    schema: ActivateModelSchema,
    preHandler: [adminAuthenticated],
    handler: activateModel,
  });
  fastify.get('/models-actions', {
    schema: GetModelActionsSchema,
    preHandler: [adminAuthenticated],
    handler: getModelActions,
  });
  fastify.patch('/:modelId/last-active', {
    schema: UpdateModelLastActiveTimeSchema,
    preHandler: [adminAuthenticated],
    handler: updateModelLastActiveTime,
  });
};

export default routes;
