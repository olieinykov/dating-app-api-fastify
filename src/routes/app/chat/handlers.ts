import { FastifyRequest, FastifyReply } from 'fastify';
import {
  CreateChatEntrySchemaType,
  CreateChatSchemaBodyType,
  GetAllChatsSchemaType,
  GetChatEntriesSchemaType,
  ReadChatEntriesSchemaType,
} from './schemas.js';
import { db } from '../../../db/index.js';
import {
  chat_entries,
  chats,
  models,
  profiles,
  files,
  chat_entry_files,
  chat_participants,
  gifts,
} from '../../../db/schema/index.js';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import ablyClient from '../../../services/ably.js';
import { chat_entries_unread } from '../../../db/schema/chat_entries_unread.js';
import { profiles_tariff } from '../../../db/schema/profile_tariff.js';
import { checkEntriesDailyLimit } from '../../../utils/tariffs/tariffs.js';

export const createChat = async (
  request: FastifyRequest<CreateChatSchemaBodyType>,
  reply: FastifyReply
) => {
  try {
    const profileUserId = request.userId;
    const [model] = await db.select().from(models).where(eq(models.id, request.body.modelId));

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
          message: 'Chat already exists',
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
      await userChannel.publish('chat-created', data);
      await adminChannel.publish('chat-created', data);
    }

    reply.code(200).send({
      success: true,
      data,
    });
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: (error as Error)?.message,
      message: 'Failed to create a new chat',
    });
  }
};

export const getAllChats = async (
  request: FastifyRequest<GetAllChatsSchemaType>,
  reply: FastifyReply
) => {
  try {
    const page = request.query.page ?? 1;
    const pageSize = request.query.pageSize ?? 10;
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

    const chatIds = userChatIds.map((c) => c.chatId);
    if (chatIds.length === 0) {
      return reply.code(200).send({
        success: true,
        data: [],
        pagination: {
          page: currentPage,
          pageSize: limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    const participants = await db
      .select({
        chatId: chat_participants.chatId,
        userId: chat_participants.userId,
        modelId: models.id,
        modelName: models.name,
        modelAvatar: models.avatar,
        modelLastActiveTime: models.lastActiveTime,
      })
      .from(chat_participants)
      .leftJoin(models, eq(chat_participants.userId, models.userId))
      .where(inArray(chat_participants.chatId, chatIds));

    const participantMap = new Map<
      number,
      Array<{
        modelId: number;
        id: string;
        name: string;
        avatar?: string;
        lastActiveTime?: Date | null;
      }>
    >();
    for (const p of participants) {
      const list = participantMap.get(p.chatId) ?? [];
      if (p.userId !== userId) {
        list.push({
          id: p.userId,
          modelId: p.modelId!,
          name: p.modelName!,
          avatar: p.modelAvatar!,
          lastActiveTime: p.modelLastActiveTime,
        });
      }
      participantMap.set(p.chatId, list);
    }

    const lastEntrySubquery = db
      .select({
        chatId: chat_entries.chatId,
        lastCreatedAt: sql`MAX(${chat_entries.createdAt})`.as('lastCreatedAt'),
      })
      .from(chat_entries)
      .groupBy(chat_entries.chatId)
      .as('last_entries');

    const lastMessages = await db
      .select({
        id: chat_entries.id,
        chatId: chat_entries.chatId,
        body: chat_entries.body,
        type: chat_entries.type,
        giftId: chat_entries.giftId,
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

    const entryIds = lastMessages.map((m) => m.id);
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
        type: message.type,
        senderId: message.senderId,
        createdAt: message.createdAt,
        includeFile: filesByEntryId.has(message.id),
        includeGift: Boolean(message.giftId),
      });
    }

    const unreadCounts = await db
      .select({
        chatId: chat_entries.chatId,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(chat_entries_unread)
      .innerJoin(chat_entries, eq(chat_entries_unread.chatEntryId, chat_entries.id))
      .where(eq(chat_entries_unread.userId, userId as string))
      .groupBy(chat_entries.chatId);

    const unreadMap = new Map<number, number>();
    for (const u of unreadCounts) {
      unreadMap.set(u.chatId!, u.count);
    }

    const sortedChatIds = [...chatIds].sort((a, b) => {
      const aDate = lastMessageMap.get(a)?.createdAt?.getTime() ?? 0;
      const bDate = lastMessageMap.get(b)?.createdAt?.getTime() ?? 0;
      return bDate - aDate;
    });

    const chatsWithParticipants = sortedChatIds.map((chatId) => ({
      id: chatId,
      participants: participantMap.get(chatId) ?? [],
      lastEntry: lastMessageMap.get(chatId) ?? null,
      unreadCount: unreadMap.get(chatId) ?? 0,
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
      },
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
    const { localEntryId, participantsIds, attachmentIds, ...payload } = request.body;

    const data = await db.transaction(async (tx) => {
      const { allowSending, entriesSent } = await checkEntriesDailyLimit(tx, request.profileId!);
      if (!allowSending) {
        throw new Error('Daily limit of entries reached');
      }

      const [entry] = await tx
        .insert(chat_entries)
        .values({
          type: 'text',
          body: payload.body,
          senderId: request.userId as string,
          chatId: request.params.chatId,
        })
        .returning();

      let attachments = undefined;

      if (attachmentIds?.length) {
        await tx
          .insert(chat_entry_files)
          .values(
            attachmentIds.map((fileId) => ({
              chatEntryId: entry.id,
              fileId,
            }))
          )
          .returning();

        attachments = await tx.select().from(files).where(inArray(files.id, attachmentIds));
      }

      const participantsWithoutCurrentUser = participantsIds?.filter(
        (userId) => userId !== request.userId
      );

      const data = await tx
        .insert(chat_entries_unread)
        .values(
          participantsWithoutCurrentUser.map((userId) => ({
            userId,
            chatId: entry.chatId,
            chatEntryId: entry.id,
          }))
        )
        .onConflictDoNothing();

      await tx
        .update(profiles_tariff)
        .set({
          entriesSentToday: entriesSent + 1,
          lastResetDate: new Date(),
        })
        .where(eq(profiles_tariff.profileId, request.profileId!))
        .returning();

      const [entryWithSender] = await tx
        .select({
          id: chat_entries.id,
          type: chat_entries.type,
          body: chat_entries.body,
          createdAt: chat_entries.createdAt,
          chatId: chat_entries.chatId,
          sender: {
            id: profiles.id,
            senderId: profiles.userId,
            name: profiles.name,
          },
        })
        .from(chat_entries)
        .leftJoin(profiles, eq(chat_entries.senderId, profiles.userId))
        .where(eq(chat_entries.id, entry.id));

      return {
        ...entryWithSender,
        attachments,
      };
    });

    if (data) {
      const usersChannel = ablyClient.channels.get(`user-events:${request.userId}`);
      const adminChannel = ablyClient.channels.get(`admin-events`);
      const eventData = { ...data, localEntryId };

      await usersChannel.publish('entry-created', eventData);
      await adminChannel.publish('entry-created', eventData);
    }

    reply.code(200).send({
      success: true,
      data: {
        ...data,
        localEntryId,
      },
    });
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: (error as Error)?.message,
      message: 'Failed to create a new chat entry',
    });
  }
};

export const getChatEntries = async (
  request: FastifyRequest<GetChatEntriesSchemaType>,
  reply: FastifyReply
) => {
  try {
    const page = Number(request.query?.page) || 1;
    const pageSize = Number(request.query?.pageSize) || 20;
    const currentPage = Math.max(1, page);
    const limit = Math.max(1, pageSize);
    const fromModelId = request.query?.fromModelId;

    const [{ count: total }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(chat_entries)
      .where(eq(chat_entries.chatId, request.params.chatId));

    const totalPages = Math.ceil(total / limit);
    const effectivePage = Math.min(currentPage, totalPages);
    const reverseOffset = Math.max(0, total - effectivePage * limit);

    const entries = await db
      .select({
        id: chat_entries.id,
        body: chat_entries.body,
        type: chat_entries.type,
        chatId: chat_entries.chatId,
        gift: {
          id: gifts.id,
          title: gifts.title,
          price: gifts.price,
          image: gifts.image,
        },
        createdAt: chat_entries.createdAt,
        updatedAt: chat_entries.updatedAt,
        fromProfile: profiles,
        fromModel: models,
        unreadUserId: chat_entries_unread.userId,
      })
      .from(chat_entries)
      .where(eq(chat_entries.chatId, request.params.chatId))
      .leftJoin(profiles, eq(chat_entries.senderId, profiles.userId))
      .leftJoin(models, eq(chat_entries.senderId, models.userId))
      .leftJoin(gifts, eq(chat_entries.giftId, gifts.id))
      .leftJoin(
        chat_entries_unread,
        and(
          eq(chat_entries_unread.chatEntryId, chat_entries.id),
          eq(chat_entries_unread.userId, fromModelId ?? request.userId!)
        )
      )
      .orderBy(asc(chat_entries.createdAt)) // Newest messages first
      .limit(limit)
      .offset(Math.max(0, reverseOffset)); // Ensure offset isn't negative

    const entriesIds = entries.map((entry) => entry.id);
    const filesList =
      entriesIds.length > 0
        ? await db
            .select({
              chatEntryId: chat_entry_files.chatEntryId,
              file: files,
            })
            .from(chat_entry_files)
            .leftJoin(files, eq(chat_entry_files.fileId, files.id))
            .where(inArray(chat_entry_files.chatEntryId, entriesIds))
        : [];

    const entriesWithFiles = (entries || []).map((entry) => {
      const { fromModel, unreadUserId, fromProfile, ...message } = entry;
      const sender = fromModel ?? fromProfile;
      const entryFiles = filesList
        .filter((file) => file.chatEntryId === entry.id)
        .map((file) => file.file);

      if (!sender) {
        throw new Error('Sender information missing');
      }

      return {
        ...message,
        attachments: entryFiles,
        isRead: unreadUserId == null,
        sender: {
          id: sender.id,
          senderId: sender.userId,
          name: sender.name,
          avatar: sender.avatar,
        },
      };
    });

    reply.code(200).send({
      success: true,
      data: entriesWithFiles,
      pagination: {
        page: effectivePage,
        pageSize: limit,
        total,
        totalPages,
        hasMore: effectivePage < totalPages,
      },
    });
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: (error as Error)?.message,
    });
  }
};

export const readChatEntries = async (
  request: FastifyRequest<ReadChatEntriesSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { entriesIds, participantId } = request.body;

    if (!entriesIds?.length) {
      return reply.code(400).send({
        success: false,
        message: 'No entry IDs provided',
      });
    }

    await db
      .delete(chat_entries_unread)
      .where(
        and(
          eq(chat_entries_unread.userId, participantId),
          inArray(chat_entries_unread.chatEntryId, entriesIds)
        )
      );

    reply.code(200).send({
      success: true,
      message: `Marked ${entriesIds.length} entries as read`,
    });
  } catch (error) {
    reply.code(500).send({
      success: false,
      error: (error as Error).message,
      message: 'Failed to mark messages as read',
    });
  }
};
