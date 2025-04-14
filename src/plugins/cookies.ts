import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';
import { FastifyInstance } from 'fastify';
import type { FastifyCookieOptions } from '@fastify/cookie';

async function cookiePlugin(fastify: FastifyInstance) {
    await fastify.register(fastifyCookie, {
        secret: 'my-secret-key', // лучше вынести в env
    } as FastifyCookieOptions);
}

export default fp(cookiePlugin, {
    name: 'cookie-plugin',
});