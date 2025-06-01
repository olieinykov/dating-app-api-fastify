import { FastifyInstance } from 'fastify'
import {getGifts, getGiftsSentFromMe, getModelFavoriteGifts, sendGiftToModel} from './handlers.js'
import {GetGiftsSchema, GetGiftsSentFromMeSchema, GetModelFavoritesSchema, SendGiftsToModelSchema} from "./schemas.js";
import { userAuthenticated } from "../../../middleware/userAuthenticated.js";

const routes = async (fastify: FastifyInstance) => {
  fastify.get('/', {
    schema: GetGiftsSchema,
    preHandler: [userAuthenticated],
    handler: getGifts
  })
  fastify.get('/models/:modelId/favorite-gifts', {
    schema: GetModelFavoritesSchema,
    preHandler: [userAuthenticated],
    handler: getModelFavoriteGifts
  })
  fastify.get('/models/:modelId/from-me', {
    schema: GetGiftsSentFromMeSchema,
    preHandler: [userAuthenticated],
    handler: getGiftsSentFromMe
  })
  fastify.post('/give', {
    schema: SendGiftsToModelSchema,
    preHandler: [userAuthenticated],
    handler: sendGiftToModel
  })
}

export default routes;