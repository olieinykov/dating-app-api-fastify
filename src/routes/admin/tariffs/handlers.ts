import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../../db/index.js';
import { tariffs } from '../../../db/schema/tariff.js';
import { CreateTariffsSchemaType, UpdateTariffsSchemaType } from './schemas';
import { eq } from 'drizzle-orm';

export const getTariffs = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await db.select().from(tariffs);
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
