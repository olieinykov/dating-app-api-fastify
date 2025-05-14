import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../../../db/schema/index.js";
import { db } from "../../../db/index.js";
import { GetModelsByPreferencesSchemaType } from "./schemas.js";

export const getModelsByPreferences = async (request: FastifyRequest<GetModelsByPreferencesSchemaType>, reply: FastifyReply) => {
    try {
        const {
            page,
            pageSize,
        } = request.query;

        const currentPage = Math.max(1, Number(page));
        const limit = Math.min(100, Math.max(1, Number(pageSize)));
        const offset = (currentPage - 1) * limit;

        const data = await db
            .select()
            .from(models)
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