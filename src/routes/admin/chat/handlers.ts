import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../../db/index.js';
import {
  models,
  chat_participants,
  profiles,
  chat_entries,
  chat_entry_files,
  files,
  model_profile_assignments,
} from '../../../db/schema/index.js';
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  ne,
  or,
  sql,
  SQL,
  SQLWrapper,
} from 'drizzle-orm';
import {
  GetAllModelsType,
  CreateChatEntrySchemaType,
  GetChatModelsSchemaType,
} from './schemas.js';
import ablyClient from '../../../services/ably.js';
import { chat_entries_unread } from '../../../db/schema/chat_entries_unread.js';

export const getModelsChats = async (
  request: FastifyRequest<GetAllModelsType>,
  reply: FastifyReply
) => {
  try {
    const [model] = await db
      .select()
      .from(models)
      .where(eq(models.id, request.params.modelId));
    const userId = model.userId;

    const page = request.query.page ?? 1;
    const pageSize = request.query.pageSize ?? 10;
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
          totalPages: 0,
        },
      });
    }

    const participants = await db
      .select({
        chatId: chat_participants.chatId,
        userId: chat_participants.userId,
        profile: profiles,
        // model: models,
      })
      .from(chat_participants)
      .leftJoin(profiles, eq(chat_participants.userId, profiles.userId))
      .leftJoin(models, eq(chat_participants.userId, models.userId))
      .where(inArray(chat_participants.chatId, chatIds));

    const participantMap = new Map<
      number,
      Array<{
        id: string;
        name?: string;
        avatar?: string;
        lastActiveTime?: Date | null;
        deactivatedAt?: Date | null;
      }>
    >();
    for (const p of participants) {
      const list = participantMap.get(p.chatId) ?? [];
      if (p.userId !== userId) {
        list.push({
          id: p.userId,
          name: p.profile?.name!,
          avatar: p.profile?.avatar!,
          lastActiveTime: p.profile?.lastActiveTime,
          deactivatedAt: p.profile?.deactivatedAt,
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

    const unreadCounts = await db
      .select({
        chatId: chat_entries.chatId,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(chat_entries_unread)
      .innerJoin(
        chat_entries,
        eq(chat_entries_unread.chatEntryId, chat_entries.id)
      )
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

    const chatsWithParticipants = sortedChatIds.map(chatId => ({
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
    const data = await db.transaction(async tx => {
      const fileIds = request.body?.attachmentIds;

      const [entry] = await tx
        .insert(chat_entries)
        .values({
          type: 'text',
          body: request.body.body,
          senderId: request.body.fromModelId as string,
          chatId: request.params.chatId,
        })
        .returning();

      let attachments = undefined;

      if (fileIds?.length) {
        await tx
          .insert(chat_entry_files)
          .values(
            fileIds.map(fileId => ({
              chatEntryId: entry.id,
              fileId,
            }))
          )
          .returning();

        attachments = await db
          .select()
          .from(files)
          .where(inArray(files.id, fileIds));
      }

      const participantsWithoutCurrentUser =
        request.body?.participantsIds?.filter(
          userId => userId !== request.body.fromModelId
        );

      await tx
        .insert(chat_entries_unread)
        .values(
          participantsWithoutCurrentUser.map(userId => ({
            userId,
            chatId: entry.chatId,
            chatEntryId: entry.id,
          }))
        )
        .onConflictDoNothing();

      const [entryWithSender] = await tx
        .select({
          id: chat_entries.id,
          type: chat_entries.type,
          body: chat_entries.body,
          createdAt: chat_entries.createdAt,
          chatId: chat_entries.chatId,
          sender: {
            id: models.id,
            senderId: models.userId,
            name: models.name,
          },
        })
        .from(chat_entries)
        .leftJoin(models, eq(chat_entries.senderId, models.userId))
        .where(eq(chat_entries.id, entry.id));

      return {
        ...entryWithSender,
        attachments,
        localEntryId: request.body.localEntryId,
      };
    });

    if (data) {
      const eventData = { ...data, localEntryId: request.body.localEntryId };
      // const usersChannel = ablyClient.channels.get(`user-events:${request.body.fromModelId}`);
      const adminChannel = ablyClient.channels.get(`admin-events`);
      // await usersChannel.publish('entry-created', eventData);
      await adminChannel.publish('entry-created', eventData);
    }

    reply.code(200).send({
      success: true,
      data: data,
    });
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: (error as Error)?.message,
      message: 'Failed to create a new chat',
    });
  }
};

export const getChatsModels = async (
  request: FastifyRequest<GetChatModelsSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { search = '', page = 1, pageSize = 10 } = request.query;

    const whereClauses = [isNull(models.deactivatedAt)];

    if (search.trim()) {
      const searchCondition = or(
        ilike(models.name, `%${search}%`),
        ilike(models.description, `%${search}%`)
      );

      if (searchCondition) {
        whereClauses.push(searchCondition);
      }
    }

    if (request.role !== 'admin') {
      const userModels = await db
        .select({ modelId: model_profile_assignments.modelId })
        .from(model_profile_assignments)
        .where(
          eq(model_profile_assignments.profileId, request.profileId as number)
        );

      if (userModels.length === 0) {
        return reply.send({
          success: true,
          data: [],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0,
          },
        });
      }

      whereClauses.push(
        inArray(
          models.id,
          userModels.map(m => m.modelId)
        )
      );
    }

    const whereCondition = and(...whereClauses);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(models)
      .where(whereCondition);
    const total = totalResult[0]?.count ?? 0;

    const currentPage = Math.max(1, Number(page));
    const limit = Math.min(100, Math.max(1, Number(pageSize)));
    const offset = (currentPage - 1) * limit;

    const allData = await db
      .select({
        id: models.id,
        userId: models.userId,
        name: models.name,
        avatar: models.avatar,
        deactivatedAt: models.deactivatedAt,
        createdAt: models.createdAt,
      })
      .from(models)
      .leftJoin(chat_participants, eq(models.userId, chat_participants.userId))
      .leftJoin(chat_entries, eq(chat_participants.chatId, chat_entries.chatId))
      .where(whereCondition)
      .groupBy(
        models.id,
        models.userId,
        models.name,
        models.avatar,
        models.deactivatedAt,
        models.createdAt
      )
      .orderBy(desc(sql`MAX(${chat_entries.createdAt})`))
      .limit(limit)
      .offset(offset);

    if (allData.length === 0) {
      return reply.send({
        success: true,
        data: [],
        pagination: {
          page: currentPage,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const modelUserIds = allData.map(model => model.userId);

    const modelChats = await db
      .select({
        userId: chat_participants.userId,
        chatId: chat_participants.chatId,
      })
      .from(chat_participants)
      .where(inArray(chat_participants.userId, modelUserIds));

    const chatsByUser = new Map<string, number[]>();
    modelChats.forEach(chat => {
      const userChats = chatsByUser.get(chat.userId) || [];
      userChats.push(chat.chatId);
      chatsByUser.set(chat.userId, userChats);
    });

    const lastEntrySubquery = db
      .select({
        chatId: chat_entries.chatId,
        lastCreatedAt: sql`MAX(${chat_entries.createdAt})`.as('lastCreatedAt'),
      })
      .from(chat_entries)
      .groupBy(chat_entries.chatId)
      .as('last_entries');

    const allChatIds = Array.from(new Set(modelChats.map(c => c.chatId)));

    if (allChatIds.length === 0) {
      const enhancedData = allData.map(model => ({
        ...model,
        unreadCount: 0,
        lastEntry: null,
      }));

      return reply.send({
        success: true,
        data: enhancedData,
        pagination: {
          page: currentPage,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

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
      .where(inArray(chat_entries.chatId, allChatIds));

    const lastMessageMap = new Map<number, (typeof lastMessages)[0]>();
    lastMessages.forEach(msg => {
      lastMessageMap.set(msg.chatId!, msg);
    });

    const unreadCounts = await db
      .select({
        userId: chat_entries_unread.userId,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(chat_entries_unread)
      .innerJoin(
        chat_entries,
        eq(chat_entries_unread.chatEntryId, chat_entries.id)
      )
      .where(inArray(chat_entries_unread.userId, modelUserIds))
      .groupBy(chat_entries_unread.userId);

    const unreadMap = new Map(
      unreadCounts.map(item => [item.userId, item.count])
    );

    const entryIds = lastMessages.map(m => m.id);

    const fileMappings =
      entryIds.length > 0
        ? await db
            .select({
              chatEntryId: chat_entry_files.chatEntryId,
              fileId: chat_entry_files.fileId,
            })
            .from(chat_entry_files)
            .where(inArray(chat_entry_files.chatEntryId, entryIds))
        : [];

    const filesByEntryId = new Map<number, string[]>();
    for (const f of fileMappings) {
      const list = filesByEntryId.get(f.chatEntryId) ?? [];
      list.push(f.fileId);
      filesByEntryId.set(f.chatEntryId, list);
    }

    const enhancedData = allData.map(model => {
      const userChats = chatsByUser.get(model.userId) || [];
      const lastEntries = userChats
        .map(chatId => lastMessageMap.get(chatId))
        .filter(Boolean);

      return {
        ...model,
        unreadCount: unreadMap.get(model.userId) || 0,
        lastEntry: lastEntries[0]
          ? {
              id: lastEntries[0].id,
              body: lastEntries[0].body,
              type: lastEntries[0].type,
              senderId: lastEntries[0].senderId,
              createdAt: lastEntries[0].createdAt,
              includeFile: filesByEntryId.has(lastEntries[0].id),
              includeGift: Boolean(lastEntries[0].giftId),
            }
          : null,
      };
    });

    reply.send({
      success: true,
      data: enhancedData,
      pagination: {
        page: currentPage,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in getChatsModels:', error);
    reply.status(500).send({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};