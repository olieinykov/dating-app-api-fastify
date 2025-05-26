import { FastifyInstance } from 'fastify'
import { getAllModels, getOneModel, deleteModel, createModel, updateModel } from './handlers.js'
import {
  CreateModelSchema,
  GetAllModelsSchema,
  DeleteModelSchema,
  UpdateModelSchema,
  GetOneModelSchema
} from "./schemas.js";
import {adminAuthenticated} from "../../../middleware/adminAuthenticated.js";

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/', {
    schema: CreateModelSchema,
    preHandler: [adminAuthenticated],
    handler: createModel
  })
  fastify.put('/:modelId', {
    schema: UpdateModelSchema,
    preHandler: [adminAuthenticated],
    handler: updateModel
  })
  fastify.get('/', {
    schema: GetAllModelsSchema,
    preHandler: [adminAuthenticated],
    handler: getAllModels
  })
  fastify.get('/:modelId', {
    schema: GetOneModelSchema,
    preHandler: [adminAuthenticated],
    handler: getOneModel
  })
  fastify.delete('/:modelId', {
    schema: DeleteModelSchema,
    preHandler: [adminAuthenticated],
    handler: deleteModel
  })
}

export default routes;