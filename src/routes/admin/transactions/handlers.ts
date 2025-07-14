import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../../db/index.js';
import {asc, desc, eq, ilike} from 'drizzle-orm';
import { gifts, models, profiles } from '../../../db/schema/index.js';
import { transactions } from "../../../db/schema/transaction.js";
import { tariffs } from "../../../db/schema/tariff.js";
import { GetTransactionSchemaType } from "./schemas";

export const getTransactions = async (request: FastifyRequest<GetTransactionSchemaType>, reply: FastifyReply) => {
  try {
      const {
          search,
          page,
          pageSize,
          sortField = 'createdAt',
          sortOrder = 'desc',
      } = request.query;
        // @ts-ignore
      const sortBy = transactions[sortField];
      const currentPage = Math.max(1, Number(page));
      const limit = Math.min(1000, Math.max(1, Number(pageSize)));
      const offset = (currentPage - 1) * limit;

        const data = await db
          .select({
              id: transactions.id,
              type: transactions.type,
              profile: profiles,
              giftToModel: models,
              gift: gifts,
              tariff: tariffs,
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
            .orderBy(desc(transactions.createdAt))
            .where(ilike(gifts.title, `%${search}%`))
            // @ts-ignore
            .orderBy(
                sortOrder === 'asc'
                    ? // @ts-ignore
                    asc(sortBy)
                    : // @ts-ignore
                    desc(sortBy)
            )
            .limit(limit)
            .offset(offset);
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
