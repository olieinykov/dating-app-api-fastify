import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateChatSchemaBodyType, GetChatEntriesSchema, GetChatEntriesSchemaType } from './schemas.js'
import { db } from "../../db/index.js";
import {chat_entries, chats} from "../../db/schema/index.js";
import {eq} from "drizzle-orm";

export const createChat = async (
  request: FastifyRequest<CreateChatSchemaBodyType>,
  reply: FastifyReply
) => {
  try {
    const [data] = await db.insert(chats).values({...request.body});
    reply.code(200).send({
      success: true,
      data,
      message: 'Chat successfully created'
    });
  } catch (error) {
      reply.code(400).send({
        success: false,
        error: (error as Error)?.message,
        message: 'Failed to create a new chat'
      })
  }
}

export const getProfileChats = async (
    request: FastifyRequest<CreateChatSchemaBodyType>,
    reply: FastifyReply
) => {
    try {
        const [data] = await db
            .select()
            .from(chats)
            // .where(eq(chats.profileId, request.params.profileId))
            // .limit(1);

        // Add pagination
        reply.code(200).send({
            success: true,
            data,
        });
    } catch (error) {
        reply.code(400).send({
            success: false,
            error: (error as Error)?.message,
        })
    }
}

export const getChatEntries = async (
    request: FastifyRequest<GetChatEntriesSchemaType>,
    reply: FastifyReply
) => {
    try {
        const [data] = await db
            .select()
            .from(chat_entries)
            .where(eq(chat_entries.chatId, request.params.chatId))
        // Add pagination
        reply.code(200).send({
            success: true,
            data,
        });
    } catch (error) {
        reply.code(400).send({
            success: false,
            error: (error as Error)?.message,
        })
    }
}