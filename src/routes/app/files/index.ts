import { FastifyInstance } from 'fastify'
import { uploadFile } from './handlers.js'
import { UploadFileSchema } from "./schemas.js";
import multipart from '@fastify/multipart';

const routes = async (fastify: FastifyInstance) => {
  fastify.register(multipart);

  fastify.post('/upload', {
    schema: UploadFileSchema,
    handler: uploadFile
  })
}

export default routes;