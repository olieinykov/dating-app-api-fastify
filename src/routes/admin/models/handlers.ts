import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from "../../../db/index.js";
import { models } from "../../../db/schema/index.js";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import {
    CreateModelType,
    DeleteModelType,
    GetAllModelsType,
    GetOneModelType,
     UpdateModelType
} from "./schemas";

export const getAllModels = async (request: FastifyRequest<GetAllModelsType>, reply: FastifyReply) => {
    try {
        const {
            search = '',
            page = 1,
            pageSize = 10,
            sortField = 'createdAt',
            sortOrder = 'desc',
        } = request.query;

        const sortBy = models[sortField as keyof typeof models];
        const currentPage = Math.max(1, Number(page));
        const limit = Math.min(100, Math.max(1, Number(pageSize)));
        const offset = (currentPage - 1) * limit;
        const whereClauses = [];


        if (search.trim()) {
            whereClauses.push(
                or(
                    ilike(models.name, `%${search}%`),
                    ilike(models.description, `%${search}%`)
                )
            );
        }

        const whereCondition = whereClauses.length ? and(...whereClauses) : undefined;
        const data = await db
            .select()
            .from(models)
            .where(whereCondition)
            .orderBy(
                sortOrder === 'asc'
                // @ts-ignore
                    ? asc(sortBy)
                    // @ts-ignore
                    : desc(sortBy)
            )
            .limit(limit)
            .offset(offset);

        const total = await db.$count(models);

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

export const getOneModel = async (request: FastifyRequest<GetOneModelType>, reply: FastifyReply) => {
    try {
        const data = await db.query.models.findFirst({
            where: eq(models.id, request.params.modelId),
        })

        console.log("data", data);

        if (data) {
            reply.send({
                status: 'success',
                data: data,
            });
        } else {
            reply.status(404).send({
                status: 'error',
                error: `No model found with id: ${request.params.modelId}`
            });
        }
    } catch (error) {
        reply.status(400).send({
            status: 'error',
            error: (error as Error)?.message
        });
    }
};

export const deleteModel = async (request: FastifyRequest<DeleteModelType>, reply: FastifyReply) => {
    try {
        const data = await db.delete(models).where(eq(models.id, request.params.modelId)).returning();

        if (data?.[0]) {
            reply.send({
                status: 'success',
                data: data,
            });
        } else {
            reply.code(404).send({
                status: 'error',
                error: `No model found with id: ${request.params.modelId}`
            });
        }
    } catch (error) {
        reply.status(400).send({
            status: 'error',
            error: (error as Error)?.message
        });
    }
};

export const createModel = async (request: FastifyRequest<CreateModelType>, reply: FastifyReply) => {
    try {
        const data = await db.insert(models).values(request.body as any).returning();
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

export const updateModel = async (request: FastifyRequest<UpdateModelType>, reply: FastifyReply) => {
    try {
        console.log()
        const data = await db.update(models)
            .set(request.body as any)
            .where(eq(models.id, request.params.modelId))
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