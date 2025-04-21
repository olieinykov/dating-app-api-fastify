import { FastifyRequest, FastifyReply } from 'fastify'
import { TelegramRegisterSchemaBodyType } from './schemas.js'
import { db } from "../../db/index.js";
import { profilesTelegram, profiles, profilesPreferences } from "../../db/schema/index.js";

export const register = async (
  request: FastifyRequest<TelegramRegisterSchemaBodyType>,
  reply: FastifyReply
) => {
  try {
    const result = await db.transaction(async (tx) => {
      const [telegramData] = await tx.insert(profilesTelegram).values({
        ...request.body
      }).returning();

      const [profileData] = await tx.insert(profiles).values({
        role: 'user',
        name: request.body.telegramName,
        telegramId: telegramData.telegramId,
      }).returning();

      await tx.insert(profilesPreferences).values({
        profileId: profileData.id
      }).returning();

      return { ...telegramData };
    });

    reply.code(200).send({
      success: true,
      data: result,
      message: 'User has been created'
    });
  } catch (error) {
      reply.code(400).send({
        success: false,
        error: (error as Error)?.message,
        message: 'Failed to create a new user'
      })
  }
}