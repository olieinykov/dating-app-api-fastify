import Fastify from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import env from './config/env.js'
import corsPlugin from './plugins/cors.js'
import cookiesPlugin from './plugins/cookies.js'
import swaggerPlugin from './plugins/swagger.js'

import telegramRoutes from './routes/telegram/index.js'
import filesRoutes from './routes/files/index.js'

import appAuthRoutes from './routes/app/auth/index.js'
import appProfileRoutes from './routes/app/profile/index.js'
import appChatRoutes from './routes/app/chat/index.js'

import adminUsersRoutes from './routes/admin/users/index.js'
import adminModelsRoutes from './routes/admin/models/index.js'
import adminGiftsRoutes from './routes/admin/gifts/index.js'
import adminAuthRoutes from './routes/admin/auth/index.js'
import adminMeRoutes from './routes/admin/me/index.js'

const fastify = Fastify({
  logger: true
})

fastify.withTypeProvider<TypeBoxTypeProvider>();

async function initialize() {
  await fastify.register(corsPlugin);
  await fastify.register(cookiesPlugin);
  await fastify.register(swaggerPlugin);

  await fastify.register(appAuthRoutes, { prefix: '/api/app/auth' })
  await fastify.register(appProfileRoutes, { prefix: '/api/app/profile' })
  await fastify.register(appChatRoutes, { prefix: '/api/app/chats' })

  await fastify.register(adminAuthRoutes, { prefix: '/api/admin/auth' })
  await fastify.register(adminUsersRoutes, { prefix: '/api/admin/users' })
  await fastify.register(adminModelsRoutes, { prefix: '/api/admin/models' })
  await fastify.register(adminGiftsRoutes, { prefix: '/api/admin/gifts' })
  await fastify.register(adminMeRoutes, { prefix: '/api/admin' })

  await fastify.register(filesRoutes, { prefix: '/api/files' })
  await fastify.register(telegramRoutes, { prefix: '/api/telegram/users' })

  try {
    await fastify.listen({ port: env.server.port, host: env.server.host })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

initialize().catch(console.error) 