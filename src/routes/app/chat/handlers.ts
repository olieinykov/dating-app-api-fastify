import { FastifyRequest, FastifyReply } from 'fastify';
import {
    CreateChatEntrySchemaType,
    CreateChatSchemaBodyType,
    GetAllChatsSchemaType,
    GetChatEntriesSchemaType
} from './schemas.js'
import { db } from "../../../db/index.js";
import { chat_entries, chats, models, profiles, files, chat_entry_files, chat_participants } from "../../../db/schema/index.js";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import ablyClient from '../../../services/ably.js'

export const createChat = async (
  request: FastifyRequest<CreateChatSchemaBodyType>,
  reply: FastifyReply
) => {
  try {
    const profileUserId = request.userId;
    const [model] = await db.select().from(models).where(eq(models.id,  request.body.modelId));

      const participantsA = await db
          .select({ chatId: chat_participants.chatId })
          .from(chat_participants)
          .where(eq(chat_participants.userId, profileUserId as string));

      const chatIdsA = participantsA.map((p) => p.chatId);
      if (chatIdsA.length > 0) {
          const existingChat: Array<{ chatId: number }> = await db
              .select({ chatId: chat_participants.chatId })
              .from(chat_participants)
              .where(
                  and(
                      inArray(chat_participants.chatId, chatIdsA),
                      eq(chat_participants.userId, model.userId)
                  )
              )
              .limit(1);

          if (!!existingChat?.length) {
              return reply.code(200).send({
                  success: false,
                  message: "Chat already exists",
              });
          }
      }

    const data = await db.transaction(async (tx) => {
        const [chat] = await tx.insert(chats).values({}).returning();

        const participants: { chatId: number; userId: string }[] = [
            { chatId: chat.id, userId: profileUserId as string },
            { chatId: chat.id, userId: model.userId as string },
        ];

        await tx.insert(chat_participants).values(participants);

        return chat;
    });

    if (data) {
        const userChannel = ablyClient.channels.get(`user-events:${profileUserId}`);
        const adminChannel = ablyClient.channels.get(`admin-events`);
        await userChannel.publish('channel-created', data);
        await adminChannel.publish('channel-created', data);
    }

    reply.code(200).send({
      success: true,
      data,
    });
  } catch (error) {
      reply.code(400).send({
        success: false,
        error: (error as Error)?.message,
        message: 'Failed to create a new chat'
      })
  }
}

export const getAllChats = async (
    request: FastifyRequest<GetAllChatsSchemaType>,
    reply: FastifyReply
) => {
    try {
        const page = request.query.page ?? 1;
        const pageSize =  request.query.pageSize ?? 10;
        const userId = request.userId;
        const currentPage = Math.max(1, page);
        const limit = Math.min(100, Math.max(1, pageSize));
        const offset = (currentPage - 1) * limit;

        const userChatIds = await db
            .select({ chatId: chat_participants.chatId })
            .from(chat_participants)
            .where(eq(chat_participants.userId, userId as string))
            .limit(limit)
            .offset(offset);

        const chatIds = userChatIds.map(c => c.chatId);
        if (chatIds.length === 0) {
            return reply.code(200).send({
                success: true,
                data: [],
                pagination: {
                    page: currentPage,
                    pageSize: limit,
                    total: 0,
                    totalPages: 0
                }
            });
        }

        const participants = await db
            .select({
                chatId: chat_participants.chatId,
                userId: chat_participants.userId,
                modelName: models.name,
                modelAvatar: files.url,
            })
            .from(chat_participants)
            .leftJoin(models, eq(chat_participants.userId, models.userId))
            .leftJoin(files, eq(files.id, models.avatarFileId))
            .where(inArray(chat_participants.chatId, chatIds));

        const participantMap = new Map<number, Array<{ id: string, name: string, avatar?: string }>>();
        for (const p of participants) {
            const list = participantMap.get(p.chatId) ?? [];
            if (p.userId !== userId) {
                list.push({
                    id: p.userId,
                    name: p.modelName!,
                    avatar: p.modelAvatar!,
                });
            }
            participantMap.set(p.chatId, list);
        }


        const lastEntrySubquery = db
            .select({
                chatId: chat_entries.chatId,
                lastCreatedAt: sql`MAX(${chat_entries.createdAt})`.as("lastCreatedAt"),
            })
            .from(chat_entries)
            .groupBy(chat_entries.chatId)
            .as("last_entries");

        const lastMessages = await db
            .select({
                id: chat_entries.id,
                chatId: chat_entries.chatId,
                body: chat_entries.body,
                createdAt: chat_entries.createdAt,
                senderId: chat_entries.senderId,
            })
            .from(chat_entries)
            .innerJoin(
                lastEntrySubquery,
                and(
                    eq(chat_entries.chatId, lastEntrySubquery.chatId),
                    eq(chat_entries.createdAt, lastEntrySubquery.lastCreatedAt)
                )
            )
            .where(inArray(chat_entries.chatId, chatIds));

        const entryIds = lastMessages.map(m => m.id);
        const fileMappings = await db
            .select({
                chatEntryId: chat_entry_files.chatEntryId,
                fileId: chat_entry_files.fileId,
            })
            .from(chat_entry_files)
            .where(inArray(chat_entry_files.chatEntryId, entryIds));

        const filesByEntryId = new Map<number, string[]>();
        for (const f of fileMappings) {
            const list = filesByEntryId.get(f.chatEntryId) ?? [];
            list.push(f.fileId);
            filesByEntryId.set(f.chatEntryId, list);
        }

        const lastMessageMap = new Map();

        for (const message of lastMessages) {
            lastMessageMap.set(message.chatId, {
                id: message.id,
                body: message.body,
                senderId: message.senderId,
                createdAt: message.createdAt,
                includeFile: filesByEntryId.has(message.id),
            });
        }

        const sortedChatIds = [...chatIds].sort((a, b) => {
            const aDate = lastMessageMap.get(a)?.createdAt?.getTime() ?? 0;
            const bDate = lastMessageMap.get(b)?.createdAt?.getTime() ?? 0;
            return bDate - aDate;
        });

        const chatsWithParticipants = sortedChatIds.map(chatId => ({
            id: chatId,
            participants: participantMap.get(chatId) ?? [],
            lastEntry: lastMessageMap.get(chatId) ?? null,
        }));

        const [{ count: total }] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(chat_participants)
            .where(eq(chat_participants.userId, userId as string));

        reply.code(200).send({
            success: true,
            data: chatsWithParticipants,
            pagination: {
                page: currentPage,
                pageSize: limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        });

    } catch (error) {
        reply.code(400).send({
            success: false,
            error: (error as Error)?.message,
        });
    }
};


export const createChatEntry = async (
    request: FastifyRequest<CreateChatEntrySchemaType>,
    reply: FastifyReply
) => {
    try {
        const data = await db.transaction(async (tx) => {
            const fileIds = request.body?.attachmentIds;

            const [entry] = await tx.insert(chat_entries).values({
                type: 'text',
                body: request.body.body,
                senderId: request.userId as string,
                chatId: request.params.chatId,
            }).returning();

            let attachments = undefined;

            if (fileIds?.length) {
                await tx.insert(chat_entry_files).values(
                    fileIds.map((fileId) => ({
                        chatEntryId: entry.id,
                        fileId,
                    }))
                ).returning();

                 attachments = await db.select()
                    .from(files)
                    .where(inArray(files.id, fileIds));
            }

            const [entryWithSender] = await tx
                .select({
                    id: chat_entries.id,
                    type: chat_entries.type,
                    body: chat_entries.body,
                    createdAt: chat_entries.createdAt,
                    chatId: chat_entries.chatId,
                    sender: {
                        id: profiles.id,
                        name: profiles.name,
                    },
                })
                .from(chat_entries)
                .leftJoin(profiles, eq(chat_entries.senderId, profiles.userId))
                .where(eq(chat_entries.id, entry.id));

            return {
                ...entryWithSender,
                attachments
            }
        });

        if (data) {
            const usersChannel = ablyClient.channels.get(`user-events:${request.userId}`);
            const adminChannel = ablyClient.channels.get(`admin-events`);
            await usersChannel.publish('entry-created', data);
            await adminChannel.publish('entry-created', data);
        }

        reply.code(200).send({
            success: true,
            data: data,
        });
    } catch (error) {
        reply.code(400).send({
            success: false,
            error: (error as Error)?.message,
            message: 'Failed to create a new chat'
        })
    }
}

export const getChatEntries = async (
    request: FastifyRequest<GetChatEntriesSchemaType>,
    reply: FastifyReply
) => {
    try {
        const page = request.query?.page ?? 1;
        const pageSize = request.query?.pageSize ?? 10;
        const currentPage = Math.max(1, page);
        const limit = Math.min(100, Math.max(1, pageSize));
        const offset = (currentPage - 1) * limit;

        const entries = await db
            .select({
                id: chat_entries.id,
                body: chat_entries.body,
                chatId: chat_entries.chatId,
                createdAt: chat_entries.createdAt,
                updatedAt: chat_entries.updatedAt,
                fromProfile: profiles,
                fromModel: models,
            })
            .from(chat_entries)
            .where(eq(chat_entries.chatId, request.params.chatId))
            .leftJoin(profiles, eq(chat_entries.senderId, profiles.userId))
            .leftJoin(models, eq(chat_entries.senderId, models.userId))
            .orderBy(desc(chat_entries.createdAt))
            .limit(limit)
            .offset(offset);

        const entriesIds = (entries || []).map(entry => entry.id);

        const filesList = await db.select({
            chatEntryId: chat_entry_files.chatEntryId,
            file: files,
        })
            .from(chat_entry_files)
            .leftJoin(files, eq(chat_entry_files.fileId, files.id))
            .where(inArray(chat_entry_files.chatEntryId, entriesIds));

        const entriesWithFiles = (entries || []).map(entry => {
            const { fromModel, fromProfile, ...message } = entry;
            const sender = fromModel ?? fromProfile;
            const entryFiles =
                filesList?.filter(file => file.chatEntryId === entry.id)?.map(file => file.file)

            if (!sender) {
                throw new Error();
            }

            return {
                ...message,
                attachments: entryFiles,
                sender: {
                    id: sender.id,
                    name: sender.name,
                }
            };
        });


        const [{ count: total }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(chat_entries)
            .where(eq(chat_entries.chatId, request.params.chatId));

        reply.code(200).send({
            success: true,
            data: entriesWithFiles,
            pagination: {
                page: currentPage,
                pageSize: limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        reply.code(400).send({
            success: false,
            error: (error as Error)?.message,
        })
    }
}