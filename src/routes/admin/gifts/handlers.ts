import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../../db/index.js';
import { gifts, gifts_actions, profiles } from '../../../db/schema/index.js';
import { asc, desc, eq, ilike, and, sql } from 'drizzle-orm';
import {
  CreateGiftType,
  DeleteGiftType,
  GetAllGiftsType,
  GetOneGiftType,
  UpdateGiftType,
  GetGiftActionsType,
} from './schemas.js';

export const getAllGifts = async (
  request: FastifyRequest<GetAllGiftsType>,
  reply: FastifyReply
) => {
  try {
    const {
      search = '',
      page = 1,
      pageSize = 10,
      sortField = 'createdAt',
      sortOrder = 'desc',
    } = request.query;

    const sortBy = gifts[sortField as keyof typeof gifts];
    const currentPage = Math.max(1, Number(page));
    const limit = Math.min(100, Math.max(1, Number(pageSize)));
    const offset = (currentPage - 1) * limit;

    const data = await db
      .select()
      .from(gifts)
      .where(ilike(gifts.title, `%${search}%`))
      .orderBy(
        sortOrder === 'asc'
          ? // @ts-ignore
            asc(sortBy)
          : // @ts-ignore
            desc(sortBy)
      )
      .limit(limit)
      .offset(offset);

    const total = await db.$count(gifts);

    reply.send({
      success: true,
      data: data,
      pagination: {
        page: currentPage,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: (error as Error)?.message,
    });
  }
};

export const getOneGift = async (
  request: FastifyRequest<GetOneGiftType>,
  reply: FastifyReply
) => {
  try {
    const data = await db.query.gifts.findFirst({
      where: eq(gifts.id, request.params.giftId),
    });

    if (data) {
      reply.send({
        success: true,
        data: data,
      });
    } else {
      reply.status(404).send({
        success: false,
        error: `No gift found with id: ${request.params.giftId}`,
      });
    }
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: (error as Error)?.message,
    });
  }
};

export const deleteGift = async (
  request: FastifyRequest<DeleteGiftType>,
  reply: FastifyReply
) => {
  try {
    const currentUserId = request.userId;
    const result = await db.transaction(async tx => {
      const [updatedGift] = await tx
        .update(gifts)
        .set({
          deactivatedAt: new Date(),
        })
        .where(eq(gifts.id, request.params.giftId))
        .returning();

      if (!updatedGift) {
        throw new Error(`No gift found with id: ${request.params.giftId}`);
      }

      await tx.insert(gifts_actions).values({
        actorId: currentUserId!,
        giftId: request.params.giftId,
        actionType: 'delete',
      });

      return updatedGift;
    });

    reply.send({
      success: true,
      data: result,
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: (error as Error)?.message,
    });
  }
};

export const createGift = async (
  request: FastifyRequest<CreateGiftType>,
  reply: FastifyReply
) => {
  try {
    const currentUserId = request.userId;
    const result = await db.transaction(async tx => {
      const [createdGift] = await db
        .insert(gifts)
        .values({
          ...request.body,
        })
        .returning();

      await tx.insert(gifts_actions).values({
        actorId: currentUserId!,
        giftId: createdGift.id,
        actionType: 'create',
      });

      return createdGift;
    });

    reply.send({
      success: true,
      data: result,
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: error,
    });
  }
};

export const updateGift = async (
  request: FastifyRequest<UpdateGiftType>,
  reply: FastifyReply
) => {
  try {
    const currentUserId = request.userId;
    const result = await db.transaction(async tx => {
      const [updatedGift] = await db
        .update(gifts)
        .set(request.body as any)
        .where(eq(gifts.id, request.params.giftId))
        .returning();

      await tx.insert(gifts_actions).values({
        actorId: currentUserId!,
        giftId: updatedGift.id,
        actionType: 'edit',
      });
      return updatedGift;
    });

    reply.send({
      success: true,
      data: result,
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: (error as Error)?.message,
    });
  }
};

export const getGiftActions = async (
  request: FastifyRequest<GetGiftActionsType>,
  reply: FastifyReply
) => {
  try {
    const {
      giftId,
      page = 1,
      pageSize = 10,
      sortOrder = 'desc',
      actionType,
    } = request.query;

    const currentPage = Math.max(1, Number(page));
    const limit = Math.min(100, Math.max(1, Number(pageSize)));
    const offset = (currentPage - 1) * limit;

    const whereClauses = [];

    if (giftId) {
      whereClauses.push(eq(gifts_actions.giftId, giftId));
    }

    if (actionType) {
      whereClauses.push(eq(gifts_actions.actionType, actionType));
    }

    const whereCondition = whereClauses.length
      ? and(...whereClauses)
      : undefined;

    const data = await db
      .select({
        id: gifts_actions.id,
        actorId: gifts_actions.actorId,
        giftId: gifts_actions.giftId,
        actionType: gifts_actions.actionType,
        actionTime: gifts_actions.actionTime,
        actorName: profiles.name,
        actorEmail: profiles.email,
        actorRole: profiles.role,
        giftName: gifts.title,
      })
      .from(gifts_actions)
      .leftJoin(profiles, eq(profiles.userId, gifts_actions.actorId))
      .leftJoin(gifts, eq(gifts.id, gifts_actions.giftId))
      .where(whereCondition)
      .orderBy(
        sortOrder === 'asc'
          ? asc(gifts_actions.actionTime)
          : desc(gifts_actions.actionTime)
      )
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ count: sql`count(*)` })
      .from(gifts_actions)
      .where(whereCondition)
      .then(result => Number(result[0]?.count || 0));

    reply.send({
      success: true,
      data: data,
      pagination: {
        page: currentPage,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: (error as Error)?.message,
    });
  }
};
