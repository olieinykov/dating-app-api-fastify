import { FastifyInstance } from 'fastify'
import { getAllGifts, createGift, updateGift, deleteGift, getOneGift } from './handlers.js'
import {
  CreateGiftSchema,
  GetAllGiftsSchema,
  DeleteGiftSchema,
  UpdateGiftSchema,
  GetOneGiftSchema
} from "./schemas.js";

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/', {
    schema: CreateGiftSchema,
    handler: createGift
  })
  fastify.put('/:giftId', {
    schema: UpdateGiftSchema,
    handler: updateGift
  })
  fastify.get('/', {
    schema: GetAllGiftsSchema,
    handler: getAllGifts
  })
  fastify.get('/:giftId', {
    schema: GetOneGiftSchema,
    handler: getOneGift
  })
  fastify.delete('/:giftId', {
    schema: DeleteGiftSchema,
    handler: deleteGift
  })
}

export default routes;