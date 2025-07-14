import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';
import env from '../config/env.js';

async function corsPlugin(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: env.appConfig.corsOrigins?.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Kuma-Revision'],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
}

export default fp(corsPlugin, {
  name: 'cors-plugin',
});
