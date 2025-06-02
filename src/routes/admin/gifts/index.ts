import { FastifyInstance } from 'fastify'
import { getAllGifts, createGift, updateGift, deleteGift, getOneGift } from './handlers.js'
import {
  CreateGiftSchema,
  GetAllGiftsSchema,
  DeleteGiftSchema,
  UpdateGiftSchema,
  GetOneGiftSchema
} from "./schemas.js";
import { adminAuthenticated } from "../../../middleware/adminAuthenticated.js";
import { GetModelFavoritesSchema } from "../../app/gifts/schemas.js";
import { getModelFavoriteGifts } from "../../app/gifts/handlers.js";

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/', {
    schema: CreateGiftSchema,
    preHandler: [adminAuthenticated],
    handler: createGift
  })
  fastify.put('/:giftId', {
    schema: UpdateGiftSchema,
    preHandler: [adminAuthenticated],
    handler: updateGift
  })
  fastify.get('/', {
    schema: GetAllGiftsSchema,
    preHandler: [adminAuthenticated],
    handler: getAllGifts
  })
  fastify.get('/:giftId', {
    schema: GetOneGiftSchema,
    preHandler: [adminAuthenticated],
    handler: getOneGift
  })
  fastify.delete('/:giftId', {
    schema: DeleteGiftSchema,
    preHandler: [adminAuthenticated],
    handler: deleteGift
  })
  fastify.get('/models/:modelId/favorite-gifts', {
    schema: GetModelFavoritesSchema,
    preHandler: [adminAuthenticated],
    handler: getModelFavoriteGifts
  })
}

export default routes;