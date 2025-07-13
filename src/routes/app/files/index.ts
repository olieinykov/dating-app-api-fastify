import { FastifyInstance } from 'fastify'
import { uploadFile } from './handlers.js'
import { UploadFileSchema } from "./schemas.js";
import multipart from '@fastify/multipart';

const routes = async (fastify: FastifyInstance) => {
  fastify.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024 // 50 MB
    }
  });

  fastify.post('/upload', {
    schema: UploadFileSchema,
    handler: uploadFile
  })
}

export default routes;