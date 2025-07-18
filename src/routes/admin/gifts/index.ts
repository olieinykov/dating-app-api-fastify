import { FastifyInstance } from 'fastify';
import {
  getAllGifts,
  createGift,
  updateGift,
  deleteGift,
  activateGift,
  getOneGift,
  getGiftActions,
} from './handlers.js';
import {
  CreateGiftSchema,
  GetAllGiftsSchema,
  DeleteGiftSchema,
  ActivateGiftSchema,
  UpdateGiftSchema,
  GetOneGiftSchema,
  GetGiftActionsSchema,
} from './schemas.js';
import { adminAuthenticated } from '../../../middleware/adminAuthenticated.js';
import { GetModelFavoritesSchema } from '../../app/gifts/schemas.js';
import { getModelFavoriteGifts } from '../../app/gifts/handlers.js';

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/', {
    schema: CreateGiftSchema,
    preHandler: [adminAuthenticated],
    handler: createGift,
  });
  fastify.put('/:giftId', {
    schema: UpdateGiftSchema,
    preHandler: [adminAuthenticated],
    handler: updateGift,
  });
  fastify.get('/', {
    schema: GetAllGiftsSchema,
    preHandler: [adminAuthenticated],
    handler: getAllGifts,
  });
  fastify.get('/:giftId', {
    schema: GetOneGiftSchema,
    preHandler: [adminAuthenticated],
    handler: getOneGift,
  });
  fastify.delete('/:giftId', {
    schema: DeleteGiftSchema,
    preHandler: [adminAuthenticated],
    handler: deleteGift,
  });
  fastify.patch('/:giftId', {
    schema: ActivateGiftSchema,
    preHandler: [adminAuthenticated],
    handler: activateGift,
  });
  fastify.get('/models/:modelId/favorite-gifts', {
    schema: GetModelFavoritesSchema,
    preHandler: [adminAuthenticated],
    handler: getModelFavoriteGifts,
  });
  fastify.get('/gifts-actions', {
    schema: GetGiftActionsSchema,
    preHandler: [adminAuthenticated],
    handler: getGiftActions,
  });
};

export default routes;
