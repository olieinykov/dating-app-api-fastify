import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

async function swaggerPlugin(fastify: any) {
    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'Amorium API',
                description: 'API documentation',
                version: '0.0.1',
            },
            tags: [
                { name: 'Auth', description: 'Authentication related endpoints' },
                { name: 'Users', description: 'User management' },
                { name: 'Gifts', description: 'Gifts management' },
                { name: 'Models', description: 'Model management' },
                { name: 'Files', description: 'Files management' },
                { name: 'Me', description: 'Current user management' },
                { name: 'Telegram', description: 'Telegram bot integration' },
            ],
        }
    });

    await fastify.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
        },
    });
}

export default fp(swaggerPlugin);