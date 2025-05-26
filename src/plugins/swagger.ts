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
                { name: 'Admin / Auth', description: 'Authentication related endpoints' },
                { name: 'Admin / Users', description: 'User management' },
                { name: 'Admin / Gifts', description: 'Gifts management' },
                { name: 'Admin / Models', description: 'Model management' },
                { name: 'App / Auth', description: 'Authentication related endpoints' },
                { name: 'App / Profile', description: 'Profile management' },
                { name: 'App / Files', description: 'Files management' },
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