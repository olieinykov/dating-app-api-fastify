import Fastify from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import env from './config/env.js'
import corsPlugin from './plugins/cors'
import cookiesPlugin from './plugins/cookies'
import swaggerPlugin from './plugins/swagger'
import authRoutes from './routes/auth'
import meRoutes from './routes/me'
import telegramRoutes from './routes/telegram'
import usersRoutes from './routes/users'
import modelsRoutes from './routes/models'
import giftsRoutes from './routes/gifts'
import filesRoutes from './routes/files'

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