import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from "../../../db/index.js";
import { profiles, profilesPreferences } from "../../../db/schema/index.js";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { CreateUserType, DeleteUserType, GetAllUsersType, GetOneUserType, UpdateUsersType } from "./schemas.js";
import { supabase } from "../../../services/supabase.js";
import { profile_actions } from "../../../db/schema/profile_action";

export const getAllUsers = async (request: FastifyRequest<GetAllUsersType>, reply: FastifyReply) => {
    try {
        const {
            role,
            search = '',
            page = 1,
            pageSize = 10,
            sortField = 'createdAt',
            sortOrder = 'desc',
        } = request.query;

        const sortBy = profiles[sortField as keyof typeof profiles];
        const currentPage = Math.max(1, Number(page));
        const limit = Math.min(100, Math.max(1, Number(pageSize)));
        const offset = (currentPage - 1) * limit;
        const whereClauses = [];


        if (role) {
            whereClauses.push(eq(profiles.role, role));
        }

        // if (search.trim()) {
        //     whereClauses.push(
        //         or(
        //             ilike(profiles.name, `%${search}%`),
        //         )
        //     );
        // }

        const whereCondition = whereClauses.length ? and(...whereClauses) : undefined;
        const users = await db
            .select({
                id: profiles.id,
                // userId:  profiles.userId,
                // name:  profiles.name,
                // email:  profiles.email,
                // telegramId: profiles.telegramId,
                // role:  profiles.role,
                // avatar: profiles.avatar,
                // bannedAt: profiles.bannedAt,
                // activatedAt:  profiles.activatedAt,
                // createdAt:  profiles.createdAt,
                // updatedAt:  profiles.updatedAt,
                // city: profilesPreferences.city,
            })
            .from(profiles)
            .leftJoin(profilesPreferences, eq(profilesPreferences.profileId, profiles.id))
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

        const total = await db.$count(profiles);

        reply.send({
            success: true,
            data: users,
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

export const getOneUser = async (request: FastifyRequest<GetOneUserType>, reply: FastifyReply) => {
    try {
        const data = await db.query.profiles.findFirst({
            where: eq(profiles.id, request.params.userId),
        })

        if (data) {
            reply.send({
                success: true,
                data: data,
            });
        } else {
            reply.status(404).send({
                success: false,
                error: `No user found with id: ${request.params.userId}`
            });
        }
    } catch (error) {
        reply.status(400).send({
            success: true,
            error: (error as Error)?.message
        });
    }
};

export const deleteUser = async (request: FastifyRequest<DeleteUserType>, reply: FastifyReply) => {
    try {
        const currentUserId = request.userId;
        const result = await db.transaction(async (tx) => {
            const [updatedProfile] = await tx.update(profiles)
                .set({
                    deactivatedAt: new Date(),
                })
                .where(eq(profiles.id, request.params.userId))
                .returning();

            if (!updatedProfile) {
                throw new Error(`No profile found with id: ${request.params.userId}`);
            }

            await tx.insert(profile_actions).values({
                authorUserId: currentUserId,
                actionGiftId: updatedProfile.id,
                actionType: "delete",
            });

            return updatedProfile;
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

export const createUser = async (request: FastifyRequest<CreateUserType>, reply: FastifyReply) => {
    try {
        const payload = {
            ...request.body,
            role: request.body.role || "chatter"
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: request.body.email,
            password: request.body.password,
        });

        if (authError) {
            return reply.code(400).send({
                success: false,
                message: authError.message
            });
        }


        const result = await db.transaction(async (tx) => {
            // const currentUserId = request.userId;
            const [createdUser] = await db.insert(profiles).values({
                ...payload,
                userId: authData.user?.id,

            }).returning();

            // await tx.insert(profile_actions).values({
            //     authorUserId: currentUserId,
            //     actionGiftId: createdUser.id,
            //     actionType: "create",
            // });
            return createdUser;
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

export const updateUser = async (request: FastifyRequest<UpdateUsersType>, reply: FastifyReply) => {
    try {
        const result = await db.transaction(async (tx) => {
            const currentUserId = request.userId;
            const [updatedUser] = await db.update(profiles)
                .set(request.body as any)
                .where(eq(profiles.id, request.params.userId))
                .returning();

            await tx.insert(profile_actions).values({
                authorUserId: currentUserId,
                actionGiftId: updatedUser.id,
                actionType: "update",
            });
            return updatedUser;
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