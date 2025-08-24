import { FastifyInstance } from 'fastify';
import {
  createChat,
  getChatEntries,
  getAllChats,
  createChatEntry,
  readChatEntries,
  buyChatEntry,
  getTotalUnreadEntries
} from './handlers.js';
import {
  CreateChatEntrySchema,
  CreateChatSchema,
  GetChatEntriesSchema,
  GetAllChatsSchema,
  ReadChatEntriesSchema,
  BuyChatEntrySchema,
  GetTotalUnreadMessagesSchema
} from './schemas.js';
import { userAuthenticated } from '../../../middleware/userAuthenticated.js';

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/', {
    handler: createChat,
    preHandler: [userAuthenticated()],
    schema: CreateChatSchema,
  });

  fastify.get('/', {
    handler: getAllChats,
    preHandler: [userAuthenticated()],
    schema: GetAllChatsSchema,
  });

  fastify.get('/:chatId/entries', {
    handler: getChatEntries,
    preHandler: [userAuthenticated()],
    schema: GetChatEntriesSchema,
  });

  fastify.get('/total-unread-entries', {
    handler: getTotalUnreadEntries,
    preHandler: [userAuthenticated()],
    schema: GetTotalUnreadMessagesSchema,
  });

  fastify.post('/:chatId/entries', {
    handler: createChatEntry,
    preHandler: [userAuthenticated()],
    schema: CreateChatEntrySchema,
  });

  fastify.post('/:chatId/entries/read', {
    handler: readChatEntries,
    preHandler: [userAuthenticated()],
    schema: ReadChatEntriesSchema,
  });
  fastify.patch('/:chatId/entries/:entryId/buy', {
    handler: buyChatEntry,
    preHandler: [userAuthenticated()],
    schema: BuyChatEntrySchema,
  });
};

export default routes;
