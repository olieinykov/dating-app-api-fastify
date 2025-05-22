import { FastifyInstance } from 'fastify'
import { uploadFile } from './handlers'
import { UploadFileSchema } from "./schemas";
import multipart from '@fastify/multipart';

const routes = async (fastify: FastifyInstance) => {
  fastify.register(multipart);

  fastify.post('/upload', {
    schema: UploadFileSchema,
    handler: uploadFile
  })
}

export default routes;