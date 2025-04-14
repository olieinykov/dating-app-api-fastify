import { FastifyInstance } from 'fastify'
import { getAllModels, getOneModel, deleteModel, createModel, updateModel } from './handlers.js'
import {
  CreateModelSchema,
  GetAllModelsSchema,
  DeleteModelSchema,
  UpdateModelSchema,
  GetOneModelSchema
} from "./schemas";

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/', {
    schema: CreateModelSchema,
    handler: createModel
  })
  fastify.put('/:modelId', {
    schema: UpdateModelSchema,
    handler: updateModel
  })
  fastify.get('/', {
    schema: GetAllModelsSchema,
    handler: getAllModels
  })
  fastify.get('/:modelId', {
    schema: GetOneModelSchema,
    handler: getOneModel
  })
  fastify.delete('/:modelId', {
    schema: DeleteModelSchema,
    handler: deleteModel
  })
}

export default routes;