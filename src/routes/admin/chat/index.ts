import { FastifyInstance } from 'fastify';
import {
  getModelsChats,
  createChatEntry,
  getChatsModels,
  getChatTransactions,
  getModelsChatEntries,
} from './handlers.js';
import {
  GetModelsChatsSchema,
  CreateChatEntrySchema,
  GetChatModelsSchema,
  GetChatTransactionsSchema,
} from './schemas.js';
import { adminAuthenticated } from '../../../middleware/adminAuthenticated.js';
import { readChatEntries } from '../../app/chat/handlers.js';
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
    handler: getModelsChatEntries,
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

  fastify.get('/transactions/:modelId/:profileId', {
    handler: getChatTransactions,
    preHandler: [adminAuthenticated],
    schema: GetChatTransactionsSchema,
  });
};

export default routes;
