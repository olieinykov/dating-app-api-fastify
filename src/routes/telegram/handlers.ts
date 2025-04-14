import { FastifyRequest, FastifyReply } from 'fastify'
import { TelegramRegisterSchemaBodyType } from './schemas.js'
import { db } from "../../db/index.js";
import { profiles } from "../../db/schema/index.js";

export const register = async (
  request: FastifyRequest<TelegramRegisterSchemaBodyType>,
  reply: FastifyReply
) => {
  try {
    const payload = {
      ...request.body,
      role: "user"
    }
    const data = await db.insert(profiles).values(payload).returning();

    reply.code(200).send({
      success: true,
      data: data[0],
    });
  } catch (error) {
      reply.code(400).send({
        success: false,
        error: (error as Error)?.message
      })
  }
}