import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';
import { FastifyInstance } from 'fastify';
import type { FastifyCookieOptions } from '@fastify/cookie';

async function cookiePlugin(fastify: FastifyInstance) {
    await fastify.register(fastifyCookie, {
        secret: 'my-secret-key', // лучше вынести в env
    } as FastifyCookieOptions);
}
// await fastify.register(cors, {
//     origin: 'http://localhost:3000', // точный фронтенд-оригин
//     credentials: true,               // разрешаем передавать куки
// })
export default fp(cookiePlugin, {
    name: 'cookie-plugin',
});