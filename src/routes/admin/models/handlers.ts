import { FastifyRequest, FastifyReply } from 'fastify'
import { v4 as uuidv4 } from 'uuid';
import { db } from "../../../db/index.js";
import { gifts, models, files } from "../../../db/schema/index.js";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import {
    CreateModelType,
    DeleteModelType,
    GetAllModelsType,
    GetOneModelType,
    UpdateModelType
} from "./schemas.js";
import { supabase } from "../../../services/supabase.js";

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
            .select({
                id: models.id,
                age: models.age,
                avatar: files.url,
                bodyType: models.bodyType,
                bustSize:  models.bustSize,
                country: models.country,
                description: models.description,
                gender: models.gender,
                hairColor: models.hairColor,
                name: models.name,
                userId: models.userId,
            })
            .from(models)
            .where(whereCondition)
            .leftJoin(files, eq(files.id, models.avatarFileId))
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

export const getOneModel = async (request: FastifyRequest<GetOneModelType>, reply: FastifyReply) => {
    try {
        const [model] = await db
            .select({
                id: models.id,
                userId: models.userId,
                name: models.name,
                country: models.country,
                avatar: files.url,
                description: models.description,
                age: models.age,
                gender: models.gender,
                bustSize: models.bustSize,
                hairColor: models.hairColor,
                bodyType: models.bodyType,
                deactivatedAt: models.deactivatedAt,
                createdAt: models.createdAt,
                updatedAt: models.updatedAt,
            })
            .from(models)
            .where(eq(models.id, request.params.modelId))
            .leftJoin(files, eq(files.id, models.avatarFileId))
            .limit(1);

        if (model) {
            reply.send({
                success: true,
                data: {
                    ...model,
                    photos: [
                        {
                            id: '51100b39-19a2-4f02-8f74-a5b2879ce322',
                            url: 'https://avbstfhignbxstnlfsef.supabase.co/storage/v1/object/public/uploads/9615b7bd-bb10-4e5c-a9a6-a06fb23fea57-pexels-maiconfotografo-15417324.jpg'
                        },
                        {
                            id: 'b4b48581-f60f-4fe4-8127-f705c660beca',
                            url: 'https://avbstfhignbxstnlfsef.supabase.co/storage/v1/object/public/uploads/6f905d38-d822-49c6-a016-b7c6c1309629-pexels-soldiervip-1391498.jpg'
                        },
                    ]
                },
            });
        } else {
            reply.status(404).send({
                success: false,
                error: `No model found with id: ${request.params.modelId}`
            });
        }
    } catch (error) {
        reply.status(400).send({
            success: false,
            error: (error as Error)?.message
        });
    }
};

export const deleteModel = async (request: FastifyRequest<DeleteModelType>, reply: FastifyReply) => {
    try {
        const currentUserId = request.userId;
        const result = await db.transaction(async (tx) => {
            const [updatedModel] = await tx.update(gifts)
                .set({
                    deactivatedAt: new Date(),
                })
                .where(eq(gifts.id, request.params.modelId))
                .returning();

            if (!updatedModel) {
                throw new Error(`No model found with id: ${request.params.modelId}`);
            }

            // await tx.insert(models_actions).values({
            //     authorUserId: currentUserId,
            //     actionGiftId: updatedModel.id,
            //     actionType: "delete",
            // });

            return updatedModel;
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

export const createModel = async (request: FastifyRequest<CreateModelType>, reply: FastifyReply) => {
    try {
        const currentUserId = request.userId;
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: `${uuidv4()}@amorium-model.com`,
            password: "MOCKED_PASSWORD",
        });

        if (authError) {
            return reply.code(400).send({
                success: false,
                message: authError.message
            });
        }

        const result = await db.transaction(async (tx) => {
            const [createdModel] = await db.insert(models).values({
                ...request.body,
                userId: authData.user?.id as string,
            }).returning();


            // await tx.insert(models_actions).values({
            //     authorUserId: currentUserId,
            //     actionGiftId: createdModel.id,
            //     actionType: "create",
            // });
            return createdModel;
        });

        reply.send({
            success: true,
            data: result
        });
    } catch (error) {
        reply.status(400).send({
            success: false,
            error: (error as Error)?.message
        });
    }
};

export const updateModel = async (request: FastifyRequest<UpdateModelType>, reply: FastifyReply) => {
    try {
        const currentUserId = request.userId;
        const result = await db.transaction(async (tx) => {
            const [updatedModel] = await db.update(models)
                .set(request.body as any)
                .where(eq(models.id, request.params.modelId))
                .returning();


            // await tx.insert(models_actions).values({
            //     authorUserId: currentUserId,
            //     actionGiftId: updatedModel.id,
            //     actionType: "update",
            // });
            return updatedModel;
        });

        reply.send({
            success: true,
            data: result
        });
    } catch (error) {
        reply.status(400).send({
            success: false,
            error: (error as Error)?.message
        });
    }
};