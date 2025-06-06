import { FastifyRequest, FastifyReply } from 'fastify'
import { v4 as uuidv4 } from 'uuid';
import { db } from "../../../db/index.js";
import { models, files, model_gifts } from "../../../db/schema/index.js";
import {and, asc, desc, eq, ilike, or, isNull} from "drizzle-orm";

import {
    CreateModelType,
    DeleteModelType,
    GetAllModelsType,
    GetOneModelType,
    UpdateModelType
} from "./schemas.js";
import { supabaseAdmin } from "../../../services/supabase.js";
import { models_photos } from "../../../db/schema/model_photos.js";
import { updateModelPhotos } from "../../../utils/files/files.js";

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

        whereClauses.push(isNull(models.deactivatedAt));

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
                avatar: models.avatar,
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
            .limit(1);

        const photos = await db.select({
            id: models_photos.fileId,
            url: files.url,
            isAvatar: models_photos.isAvatar,
        }).from(models_photos)
            .where(eq(models_photos.modelId, request.params.modelId))
            .leftJoin(files, eq(files.id, models_photos.fileId))

        if (model) {
            reply.send({
                success: true,
                data: {
                    ...model,
                    photos
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
        const result = await db.transaction(async (tx) => {
            const [updatedModel] = await tx.update(models)
                .set({
                    deactivatedAt: new Date(),
                })
                .where(eq(models.id, request.params.modelId))
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
        const { photos = [], favoriteGiftIds, ...payload } = request.body;
        const {  data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: `${uuidv4()}@amorium-model.com`,
            password: "MOCKED_PASSWORD",
            email_confirm: true,
            user_metadata: {
                role: "model"
            },
        });


        if (authError) {
            return reply.code(400).send({
                success: false,
                message: authError.message
            });
        }

        const result = await db.transaction(async (tx) => {
            let [createdModel] = await tx.insert(models).values({
                ...payload,
                userId: authData.user?.id as string,
            }).returning();

            let modelPhotos = undefined;
            if (photos.length) {
                const photosValues = photos.map((file => ({
                    modelId: createdModel?.id!,
                    fileId: file.id,
                    isAvatar: file.isAvatar,
                })));

                await tx.insert(models_photos).values(photosValues).returning();

                modelPhotos = await tx
                    .select({
                        id: models_photos.fileId,
                        url: files.url,
                        isAvatar: models_photos.isAvatar,
                    })
                    .from(models_photos)
                    .where(eq(models_photos.modelId, createdModel.id))
                    .leftJoin(files, eq(files.id, models_photos.fileId))



                const [data] = await tx.update(models).set({
                    avatar: modelPhotos?.find(photo => photo?.isAvatar === true)?.url,
                })
                    .where(eq(models.id, createdModel.id))
                    .returning();

                createdModel = data;

                if (favoriteGiftIds?.length) {
                    const giftsValues = favoriteGiftIds.map((giftId => ({
                        modelId: createdModel?.id!,
                        giftId: giftId,
                    })));

                    await tx.insert(model_gifts).values(giftsValues).returning();
                }
            }

            return {
                ...createdModel,
                photos: modelPhotos,
            };
        });

        reply.send({
            success: true,
            data: result
        });
    } catch (error) {
        console.log("error", error);
        reply.status(400).send({
            success: false,
            error: (error as Error)?.message
        });
    }
};

export const updateModel = async (request: FastifyRequest<UpdateModelType>, reply: FastifyReply) => {
    try {
        const { photos = [], favoriteGiftIds, ...payload } = request.body;
        const modelId = request.params.modelId;

        const result = await db.transaction(async (tx) => {
            try {
                let modelPhotos = undefined;
                let updatedModel = {};

                if (photos.length) {
                    modelPhotos = await updateModelPhotos(tx, modelId, photos);
                }

                if (Object.keys(payload ?? {}).length) {
                    const avatar = modelPhotos?.find(photo => photo?.isAvatar === true)?.url;

                    const [data] = await tx.update(models)
                        .set({
                            ...payload,
                            avatar,
                        })
                        .where(eq(models.id, modelId))
                        .returning();
                    updatedModel = data;
                }

                if (favoriteGiftIds?.length === 0) {
                    await tx.delete(model_gifts).where(eq(model_gifts.modelId, modelId)).returning();
                }

                if (favoriteGiftIds?.length) {
                    const giftsValues = favoriteGiftIds.map((giftId => ({
                        modelId: modelId!,
                        giftId: giftId,
                    })));
                    await tx.delete(model_gifts).where(eq(model_gifts.modelId, modelId)).returning();
                    await tx.insert(model_gifts).values(giftsValues).returning();
                }

                return {
                    ...updatedModel,
                    photos: modelPhotos,
                };
            } catch (error) {
                console.log("TRANSACTION ERROR", error);
            }
        });

        reply.send({
            success: true,
            data: result
        });
    } catch (error) {
        console.log("error", error)
        reply.status(400).send({
            success: false,
            error: (error as Error)?.message
        });
    }
};