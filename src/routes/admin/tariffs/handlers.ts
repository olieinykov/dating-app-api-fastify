import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from "../../../db/index.js";
import { tariffs } from "../../../db/schema/tariff.js";

export const getTariffs = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
  try {
    const data = await db.select().from(tariffs);
    return reply.code(200).send({
      success: true,
      data
    });
  } catch (error) {
    return reply.code(400).send({
      success: false,
    });
  }
}