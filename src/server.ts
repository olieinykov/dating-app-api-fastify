import Fastify from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import env from './config/env.js'
import corsPlugin from './plugins/cors.js'
import cookiesPlugin from './plugins/cookies.js'
import swaggerPlugin from './plugins/swagger.js'
import authRoutes from './routes/auth/index.js'
import meRoutes from './routes/me/index.js'
import telegramRoutes from './routes/telegram/index.js'
import usersRoutes from './routes/users/index.js'
import modelsRoutes from './routes/models/index.js'
import giftsRoutes from './routes/gifts/index.js'
import filesRoutes from './routes/files/index.js'

const fastify = Fastify({
  logger: true
})

fastify.withTypeProvider<TypeBoxTypeProvider>();

async function initialize() {
  await fastify.register(corsPlugin);
  await fastify.register(cookiesPlugin);
  await fastify.register(swaggerPlugin);

  await fastify.register(authRoutes, { prefix: '/api/auth' })
  await fastify.register(meRoutes, { prefix: '/api/me' })
  await fastify.register(telegramRoutes, { prefix: '/api/telegram/users' })
  await fastify.register(usersRoutes, { prefix: '/api/users' })
  await fastify.register(modelsRoutes, { prefix: '/api/models' })
  await fastify.register(giftsRoutes, { prefix: '/api/gifts' })
  await fastify.register(filesRoutes, { prefix: '/api/files' })

  try {
    await fastify.listen({ port: env.server.port })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

initialize().catch(console.error) 