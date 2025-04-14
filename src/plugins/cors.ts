import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';

async function corsPlugin(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: true,
  });
}

export default fp(corsPlugin, {
  name: 'cors-plugin',
});