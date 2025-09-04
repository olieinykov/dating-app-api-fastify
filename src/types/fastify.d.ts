import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    profileId?: number;
    profile?: any;
    role: string;
  }
}
