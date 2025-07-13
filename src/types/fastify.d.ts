import 'fastify';

declare module 'fastify' {
    interface FastifyRequest {
        userId?: string;
        profileId?: number;
        role: string;
    }
}