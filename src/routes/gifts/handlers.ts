import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from "../../db/index.js";
import { gifts } from "../../db/schema/index.js";
import {and, asc, desc, eq, ilike, or, sql} from "drizzle-orm";
import {
    CreateGiftType,
    DeleteGiftType,
    GetAllGiftsType,
    GetOneGiftType,
    UpdateGiftType
} from "./schemas";

export const getAllGifts = async (request: FastifyRequest<GetAllGiftsType>, reply: FastifyReply) => {
    try {
        const {
            search = '',
            page = 1,
            pageSize = 10,
            sortField = 'createdAt',
            sortOrder = 'desc',
        } = request.query;

        console.log("request.query", request.query)

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
            status: 'success',
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
            status: 'error',
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
                status: 'success',
                data: data,
            });
        } else {
            reply.status(404).send({
                status: 'error',
                error: `No gift found with id: ${request.params.giftId}`
            });
        }
    } catch (error) {
        reply.status(400).send({
            status: 'error',
            error: (error as Error)?.message
        });
    }
};

export const deleteGift = async (request: FastifyRequest<DeleteGiftType>, reply: FastifyReply) => {
    try {
        const data = await db.delete(gifts).where(eq(gifts.id, request.params.giftId)).returning();

        if (data?.[0]) {
            reply.send({
                status: 'success',
                data: data,
            });
        } else {
            reply.code(404).send({
                status: 'error',
                error: `No gift found with id: ${request.params.giftId}`
            });
        }
    } catch (error) {
        reply.status(400).send({
            status: 'error',
            error: (error as Error)?.message
        });
    }
};

export const createGift = async (request: FastifyRequest<CreateGiftType>, reply: FastifyReply) => {
    try {
        const data = await db.insert(gifts).values(request.body as any).returning();
        reply.send({
            status: 'success',
            data: data[0]
        });
    } catch (error) {
        console.log("error", error);
        reply.status(400).send({
            status: 'error',
            error: error
        });
    }
};

export const updateGift = async (request: FastifyRequest<UpdateGiftType>, reply: FastifyReply) => {
    try {
        const data = await db.update(gifts)
            .set(request.body as any)
            .where(eq(gifts.id, request.params.giftId))
            .returning();

        reply.send({
            status: 'success',
            data: data[0]
        });
    } catch (error) {
        reply.status(400).send({
            status: 'error',
            error: (error as Error)?.message
        });
    }
};