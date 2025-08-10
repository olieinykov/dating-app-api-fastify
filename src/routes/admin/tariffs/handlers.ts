import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../../db/index.js';
import { tariffs } from '../../../db/schema/tariff.js';
import {
  CreateTariffsSchemaType,
  UpdateTariffsSchemaType,
  DeleteTariffSchemaType,
  GetTariffsSchemaType,
} from './schemas';
import { eq, or, and, sql } from 'drizzle-orm';

export const getTariffs = async (
  request: FastifyRequest<GetTariffsSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { search = '', page = 1, pageSize = 10 } = request.query;

    const currentPage = Math.max(1, Number(page));
    const limit = Math.min(100, Math.max(1, Number(pageSize)));
    const offset = (currentPage - 1) * limit;

    const whereClauses = [];

    if (search.trim()) {
      const searchNumber = Number(search);
      if (!isNaN(searchNumber)) {
        whereClauses.push(
          or(eq(tariffs.price, searchNumber), eq(tariffs.daysPeriod, searchNumber))
        );
      }
    }

    const whereCondition = whereClauses.length ? and(...whereClauses) : undefined;

    const data = await db.select().from(tariffs).where(whereCondition).limit(limit).offset(offset);

    const total = await db
      .select({ count: sql`count(*)` })
      .from(tariffs)
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
    });
  }
};

export const createTariff = async (
  request: FastifyRequest<CreateTariffsSchemaType>,
  reply: FastifyReply
) => {
  try {
    const [data] = await db
      .insert(tariffs)
      .values({
        price: request.body.price,
        daysPeriod: request.body.daysPeriod,
      })
      .returning();
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

export const updateTariff = async (
  request: FastifyRequest<UpdateTariffsSchemaType>,
  reply: FastifyReply
) => {
  try {
    const [data] = await db
      .update(tariffs)
      .set({
        price: request.body.price,
        daysPeriod: request.body.daysPeriod,
      })
      .where(eq(tariffs.id, request.params.tariffId))
      .returning();

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

export const deleteTariff = async (
  request: FastifyRequest<DeleteTariffSchemaType>,
  reply: FastifyReply
) => {
  try {
    const allTariffs = await db.select().from(tariffs);

    if (allTariffs.length === 1) {
      return reply.code(400).send({
        success: false,
        message: 'You cannot delete the last tariff',
      });
    }

    const [data] = await db
      .delete(tariffs)
      .where(eq(tariffs.id, request.params.tariffId))
      .returning();

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
