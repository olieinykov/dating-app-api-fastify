import { FastifyInstance } from 'fastify'
import { createChat, getChatEntries } from './handlers'
import { CreateChatSchema, GetChatEntriesSchema } from './schemas'

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/', {
    handler: createChat,
    schema: CreateChatSchema,
  })

  fastify.get('/:chatId', {
    handler: getChatEntries,
    schema: GetChatEntriesSchema,
  })
}

export default routes;