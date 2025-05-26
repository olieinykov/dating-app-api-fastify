import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from "../../../db/index.js";
import { gifts } from "../../../db/schema/index.js";
import { asc, desc, eq, ilike } from "drizzle-orm";
import {
    CreateGiftType,
    DeleteGiftType,
    GetAllGiftsType,
    GetOneGiftType,
    UpdateGiftType
} from "./schemas.js";
import { gift_actions } from "../../../db/schema/gift_action";

export const getAllGifts = async (request: FastifyRequest<GetAllGiftsType>, reply: FastifyReply) => {
    try {
        const {
            search = '',
            page = 1,
            pageSize = 10,
            sortField = 'createdAt',
            sortOrder = 'desc',
        } = request.query;

        const sortBy = gifts[sortField as keyof typeof gifts]
        const currentPage = Math.max(1, Number(page));
        const limit = Math.min(100, Math.max(1, Number(pageSize)));
        const offset = (currentPage - 1) * limit;

        const data = await db
            .select()
            .from(gifts)
            .where(ilike(gifts.title, `%${search}%`))
            .orderBy(
                sortOrder === 'asc'
                // @ts-ignore
                    ? asc(sortBy)
                    // @ts-ignore
                    : desc(sortBy)
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
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        reply.status(400).send({
            success: false,
            error: (error as Error)?.message
        });
    }
};

export const getOneGift = async (request: FastifyRequest<GetOneGiftType>, reply: FastifyReply) => {
    try {
        const data = await db.query.gifts.findFirst({
            where: eq(gifts.id, request.params.giftId),
        })

        if (data) {
            reply.send({
                success: true,
                data: data,
            });
        } else {
            reply.status(404).send({
                success: false,
                error: `No gift found with id: ${request.params.giftId}`
            });
        }
    } catch (error) {
        reply.status(400).send({
            success: false,
            error: (error as Error)?.message
        });
    }
};

export const deleteGift = async (request: FastifyRequest<DeleteGiftType>, reply: FastifyReply) => {
    try {
        const currentUserId = request.userId;
        const result = await db.transaction(async (tx) => {
            const [updatedGift] = await tx.update(gifts)
                .set({
                    deactivatedAt: new Date(),
                })
                .where(eq(gifts.id, request.params.giftId))
                .returning();

            if (!updatedGift) {
                throw new Error(`No gift found with id: ${request.params.giftId}`);
            }

            // await tx.insert(gift_actions).values({
            //     authorUserId: currentUserId,
            //     actionGiftId: request.params.giftId,
            //     actionType: "delete",
            // });

            return updatedGift;
        });

        reply.send({
            success: true,
            data: result,
        });
    } catch (error) {
        reply.status(400).send({
            success: false,
            error: (error as Error)?.message
        });
    }
};

export const createGift = async (request: FastifyRequest<CreateGiftType>, reply: FastifyReply) => {
    try {
        const currentUserId = request.userId;
        const result = await db.transaction(async (tx) => {
            const [createdGift] = await db.insert(gifts).values({
                ...request.body,
            }).returning();

            // await tx.insert(gift_actions).values({
            //     authorUserId: currentUserId,
            //     actionGiftId: createdGift.id,
            //     actionType: "create",
            // });
            return createdGift;
        });

        reply.send({
            success: true,
            data: result
        });
    } catch (error) {
        reply.status(400).send({
            success: false,
            error: error
        });
    }
};

export const updateGift = async (request: FastifyRequest<UpdateGiftType>, reply: FastifyReply) => {
    try {
        const currentUserId = request.userId;
        const result = await db.transaction(async (tx) => {
            const [updatedGift] = await db.update(gifts)
                .set(request.body as any)
                .where(eq(gifts.id, request.params.giftId))
                .returning();

            // await tx.insert(gift_actions).values({
            //     authorUserId: currentUserId,
            //     actionGiftId: updatedGift.id,
            //     actionType: "update",
            // });
            return updatedGift;
        });

        reply.send({
            success: true,
            data: result,
        });
    } catch (error) {
        reply.status(400).send({
            success: false,
            error: (error as Error)?.message
        });
    }
};