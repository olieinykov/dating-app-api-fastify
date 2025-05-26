import { FastifyInstance } from 'fastify'
import { getModelsChats, createChatEntry } from './handlers.js'
import { GetModelsChatsSchema, CreateChatEntrySchema } from "./schemas.js";
import { adminAuthenticated } from "../../../middleware/adminAuthenticated.js";
import { getChatEntries } from "../../app/chat/handlers.js";
import { GetChatEntriesSchema } from "../../app/chat/schemas.js";

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/models/:modelId', {
    schema: GetModelsChatsSchema,
    preHandler: [adminAuthenticated],
    handler: getModelsChats
  })

  fastify.get('/:chatId/entries', {
    handler: getChatEntries,
    preHandler: [adminAuthenticated],
    schema: GetChatEntriesSchema,
  })

  fastify.post('/:chatId/entries', {
    handler: createChatEntry,
    preHandler: [adminAuthenticated],
    schema: CreateChatEntrySchema,
  })
}

export default routes;