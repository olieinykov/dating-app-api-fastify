import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../../db/index.js';
import { eq } from 'drizzle-orm';
import { gifts, models, profiles } from '../../../db/schema/index.js';
import { transactions } from "../../../db/schema/transaction.js";
import { tariffs } from "../../../db/schema/tariff.js";

export const getTransactions = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        profile: profiles,
        giftToModel: models,
        gift: gifts,
        tokensAmount: transactions.tokensAmount,
        status: transactions.status,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
      })
      .from(transactions)
      .leftJoin(profiles, eq(transactions.profileId, profiles.id))
      .leftJoin(gifts, eq(transactions.giftId, gifts.id))
      .leftJoin(models, eq(transactions.modelId, models.id))
      .leftJoin(tariffs, eq(transactions.tariffId, tariffs.id))
    return reply.code(200).send({
      success: true,
      data,
    });
  } catch (error) {
    return reply.code(400).send({
      success: false,
    });
  }
};
