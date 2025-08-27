import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../../db/index.js';
import { asc, desc, eq, ilike, or, and, sql } from 'drizzle-orm';
import { chat_entries, gifts, models, profiles } from '../../../db/schema/index.js';
import { transactions, transactionStatusEnum } from '../../../db/schema/transaction.js';
import { tariffs } from '../../../db/schema/tariff.js';
import { GetTransactionSchemaType } from './schemas';

export const getTransactions = async (
  request: FastifyRequest<GetTransactionSchemaType>,
  reply: FastifyReply
) => {
  try {
    const {
      search = '',
      page,
      status,
      pageSize,
      sortField = 'createdAt',
      sortOrder = 'desc',
    } = request.query;

    const sortFieldMap = {
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
    } as const;

    const sortBy = sortFieldMap[sortField as keyof typeof sortFieldMap];
    const currentPage = Math.max(1, Number(page));
    const limit = Math.min(1000, Math.max(1, Number(pageSize)));
    const offset = (currentPage - 1) * limit;

    const whereClauses = [];

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      whereClauses.push(or(ilike(profiles.name, searchTerm), ilike(models.name, searchTerm)));
    }

    if (status) {
      whereClauses.push(
        eq(
          transactions.status,
          status.toLowerCase() as (typeof transactionStatusEnum.enumValues)[number]
        )
      );
    }

    const whereCondition = whereClauses.length ? and(...whereClauses) : undefined;
    const data = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        profile: profiles,
        model: models,
        gift: gifts,
        chatEntry: chat_entries,
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
      .leftJoin(chat_entries, eq(transactions.chatEntryId, chat_entries.id))
      .leftJoin(tariffs, eq(transactions.tariffId, tariffs.id))
      .where(whereCondition)
      .orderBy(sortOrder === 'asc' ? asc(sortBy) : desc(sortBy))
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ count: sql`count(*)` })
      .from(transactions)
      .leftJoin(profiles, eq(transactions.profileId, profiles.id))
      .leftJoin(models, eq(transactions.modelId, models.id))
      .where(whereCondition)
      .then((result) => Number(result[0]?.count || 0));

    return reply.code(200).send({
      success: true,
      data,
      pagination: {
        page: currentPage,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return reply.code(400).send({
      success: false,
      error: (error as Error)?.message,
    });
  }
};
