import { FastifyInstance } from 'fastify'
import { createChat, getChatEntries, getAllChats, createChatEntry } from './handlers'
import { CreateChatEntrySchema, CreateChatSchema, GetChatEntriesSchema, GetAllChatsSchema } from './schemas'
import { userAuthenticated } from "../../../middleware/userAuthenticated";

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/', {
    handler: createChat,
    preHandler: [userAuthenticated],
    schema: CreateChatSchema,
  })

  fastify.get('/', {
    handler: getAllChats,
    preHandler: [userAuthenticated],
    schema: GetAllChatsSchema,
  })

  fastify.get('/:chatId/entries', {
    handler: getChatEntries,
    preHandler: [userAuthenticated],
    schema: GetChatEntriesSchema,
  })

  fastify.post('/:chatId/entries', {
    handler: createChatEntry,
    preHandler: [userAuthenticated],
    schema: CreateChatEntrySchema,
  })
}

export default routes;