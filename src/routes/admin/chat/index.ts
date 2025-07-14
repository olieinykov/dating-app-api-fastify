import { FastifyInstance } from 'fastify';
import { getModelsChats, createChatEntry, getChatsModels } from './handlers.js';
import { GetModelsChatsSchema, CreateChatEntrySchema, GetChatModelsSchema } from './schemas.js';
import { adminAuthenticated } from '../../../middleware/adminAuthenticated.js';
import { getChatEntries, readChatEntries } from '../../app/chat/handlers.js';
import { GetChatEntriesSchema, ReadChatEntriesSchema } from '../../app/chat/schemas.js';

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/models', {
    schema: GetChatModelsSchema,
    preHandler: [adminAuthenticated],
    handler: getChatsModels,
  });

  fastify.get('/models/:modelId', {
    schema: GetModelsChatsSchema,
    preHandler: [adminAuthenticated],
    handler: getModelsChats,
  });

  fastify.get('/:chatId/entries', {
    handler: getChatEntries,
    preHandler: [adminAuthenticated],
    schema: GetChatEntriesSchema,
  });

  fastify.post('/:chatId/entries', {
    handler: createChatEntry,
    preHandler: [adminAuthenticated],
    schema: CreateChatEntrySchema,
  });

  fastify.post('/:chatId/entries/read', {
    handler: readChatEntries,
    preHandler: [adminAuthenticated],
    schema: ReadChatEntriesSchema,
  });
};

export default routes;
