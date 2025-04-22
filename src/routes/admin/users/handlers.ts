import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from "../../../db/index.js";
import { profiles } from "../../../db/schema/index.js";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { CreateUserType, DeleteUserType, GetAllUsersType, GetOneUserType, UpdateUsersType } from "./schemas.js";
import {supabase} from "../../../services/supabase.js";

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

        if (search.trim()) {
            whereClauses.push(
                or(
                    ilike(profiles.name, `%${search}%`),
                )
            );
        }

        const whereCondition = whereClauses.length ? and(...whereClauses) : undefined;
        const users = await db
            .select()
            .from(profiles)
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
            status: 'success',
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
            status: 'error',
            error: (error as Error)?.message
        });
    }
};

export const getOneUser = async (request: FastifyRequest<GetOneUserType>, reply: FastifyReply) => {
    try {
        const data = await db.query.profiles.findFirst({
            where: eq(profiles.id, request.params.userId),
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
                error: `No user found with id: ${request.params.userId}`
            });
        }
    } catch (error) {
        reply.status(400).send({
            status: 'error',
            error: (error as Error)?.message
        });
    }
};

export const deleteUser = async (request: FastifyRequest<DeleteUserType>, reply: FastifyReply) => {
    try {
        const data = await db.delete(profiles).where(eq(profiles.id, request.params.userId)).returning();
        console.log("data", data);

        if (data?.[0]) {
            reply.send({
                status: 'success',
                data: data,
            });
        } else {
            reply.code(404).send({
                status: 'error',
                error: `No user found with id: ${request.params.userId}`
            });
        }
    } catch (error) {
        reply.status(400).send({
            status: 'error',
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
                status: 'error',
                message: authError.message
            });
        }

        const data = await db.insert(profiles).values({
            ...payload,
            userId: authData.user?.id,

        }).returning();
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

export const updateUser = async (request: FastifyRequest<UpdateUsersType>, reply: FastifyReply) => {
    try {
        const data = await db.update(profiles)
            .set(request.body as any)
            .where(eq(profiles.id, request.params.userId))
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