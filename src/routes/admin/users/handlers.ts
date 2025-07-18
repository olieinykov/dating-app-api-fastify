import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../../db/index.js';
import { profiles, profilesPreferences, profiles_actions } from '../../../db/schema/index.js';
import { and, asc, desc, eq, ilike, isNotNull, isNull, or, sql } from 'drizzle-orm';
import {
  CreateUserType,
  DeleteUserType,
  ActivateUserType,
  GetAllUsersType,
  GetOneUserType,
  UpdateUsersType,
  GetUserActionsType,
} from './schemas.js';
import { supabaseAdmin } from '../../../services/supabase.js';

export const getAllUsers = async (
  request: FastifyRequest<GetAllUsersType>,
  reply: FastifyReply
) => {
  try {
    const {
      role,
      search = '',
      page = 1,
      pageSize = 10,
      sortField = 'createdAt',
      sortOrder = 'desc',
      deactivated = undefined,
    } = request.query;

    type UserRole = 'admin' | 'chatter' | 'user';

    const allowedRoles: UserRole[] = ['admin', 'chatter', 'user'];

    const sortBy = profiles[sortField as keyof typeof profiles];
    const currentPage = Math.max(1, Number(page));
    const limit = Math.min(100, Math.max(1, Number(pageSize)));
    const offset = (currentPage - 1) * limit;
    const whereClauses = [];

    if (deactivated === true) {
      // whereClauses.push(ne(profiles.deactivatedAt, null));
      whereClauses.push(isNotNull(profiles.deactivatedAt));
    }
    if (deactivated === false) {
      whereClauses.push(isNull(profiles.deactivatedAt));
    }

    if (role && allowedRoles.includes(role as UserRole)) {
      whereClauses.push(eq(profiles.role, role as UserRole));
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
        userId: profiles.userId,
        name: profiles.name,
        email: profiles.email,
        telegramId: profiles.telegramId,
        role: profiles.role,
        avatar: profiles.avatar,
        deactivatedAt: profiles.deactivatedAt,
        activatedAt: profiles.activatedAt,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
        city: profilesPreferences.city,
      })
      .from(profiles)
      .leftJoin(profilesPreferences, eq(profilesPreferences.profileId, profiles.id))
      .where(whereCondition)
      .orderBy(
        sortOrder === 'asc'
          ? // @ts-ignore
            asc(sortBy)
          : // @ts-ignore
            desc(sortBy)
      )
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ count: sql`count(*)` })
      .from(profiles)
      .where(whereCondition)
      .then((result) => Number(result[0]?.count || 0));

    reply.send({
      success: true,
      data: users,
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

export const getOneUser = async (request: FastifyRequest<GetOneUserType>, reply: FastifyReply) => {
  try {
    const data = await db.query.profiles.findFirst({
      where: eq(profiles.id, request.params.userId),
    });

    if (data) {
      reply.send({
        success: true,
        data: data,
      });
    } else {
      reply.status(404).send({
        success: false,
        error: `No user found with id: ${request.params.userId}`,
      });
    }
  } catch (error) {
    reply.status(400).send({
      success: true,
      error: (error as Error)?.message,
    });
  }
};

export const deleteUser = async (request: FastifyRequest<DeleteUserType>, reply: FastifyReply) => {
  try {
    const currentUserId = request.userId;
    const result = await db.transaction(async (tx) => {
      const [updatedProfile] = await tx
        .update(profiles)
        .set({
          deactivatedAt: new Date(),
        })
        .where(eq(profiles.id, request.params.userId))
        .returning();

      if (!updatedProfile) {
        throw new Error(`No profile found with id: ${request.params.userId}`);
      }

      await tx.insert(profiles_actions).values({
        actorId: currentUserId!,
        profileId: updatedProfile.id,
        actionType: 'delete',
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
      error: (error as Error)?.message,
    });
  }
};

export const activateUser = async (
  request: FastifyRequest<ActivateUserType>,
  reply: FastifyReply
) => {
  try {
    const currentUserId = request.userId;

    const result = await db.transaction(async (tx) => {
      const [updatedProfile] = await tx
        .update(profiles)
        .set({ deactivatedAt: null })
        .where(eq(profiles.id, request.params.userId))
        .returning();
      if (!updatedProfile) {
        throw new Error(`No model found with id: ${request.params.userId}`);
      }
      await tx.insert(profiles_actions).values({
        actorId: currentUserId!,
        profileId: updatedProfile.id,
        actionType: 'edit',
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
      error: (error as Error)?.message,
    });
  }
};

export const createUser = async (request: FastifyRequest<CreateUserType>, reply: FastifyReply) => {
  try {
    const payload = {
      ...request.body,
      role: request.body.role || 'chatter',
    };

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: request.body.email,
      password: request.body.password,
      email_confirm: true,
      user_metadata: {
        role: payload.role,
      },
    });

    if (authError) {
      return reply.code(400).send({
        success: false,
        message: authError.message,
      });
    }

    const result = await db.transaction(async (tx) => {
      const [createdUser] = await tx
        .insert(profiles)
        .values({
          ...payload,
          userId: authData.user?.id,
        })
        .returning();

      // const currentUserId = request.userId;
      // await tx.insert(profiles_actions).values({
      //   actorId: currentUserId!,
      //   profileId: createdUser.id,
      //   actionType: 'create',
      // });
      return createdUser;
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

export const updateUser = async (request: FastifyRequest<UpdateUsersType>, reply: FastifyReply) => {
  try {
    const result = await db.transaction(async (tx) => {
      const currentUserId = request.userId;
      const [updatedUser] = await tx
        .update(profiles)
        .set(request.body as any)
        .where(eq(profiles.id, request.params.userId))
        .returning();

      await tx.insert(profiles_actions).values({
        actorId: currentUserId!,
        profileId: updatedUser.id,
        actionType: 'edit',
      });

      return updatedUser;
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

export const getUserActions = async (
  request: FastifyRequest<GetUserActionsType>,
  reply: FastifyReply
) => {
  try {
    const { profileId, page = 1, pageSize = 10, sortOrder = 'desc', actionType } = request.query;

    const currentPage = Math.max(1, Number(page));
    const limit = Math.min(100, Math.max(1, Number(pageSize)));
    const offset = (currentPage - 1) * limit;
    const whereClauses = [];

    if (profileId) {
      whereClauses.push(eq(profiles_actions.profileId, profileId));
    }

    if (actionType) {
      whereClauses.push(eq(profiles_actions.actionType, actionType));
    }

    const whereCondition = whereClauses.length ? and(...whereClauses) : undefined;

    const data = await db
      .select({
        id: profiles_actions.id,
        actorId: profiles_actions.actorId,
        profileId: profiles_actions.profileId,
        actionType: profiles_actions.actionType,
        actionTime: profiles_actions.actionTime,
        actorName: profiles.name,
        actorEmail: profiles.email,
        actorRole: profiles.role,
        profileName: profiles.name,
      })
      .from(profiles_actions)
      .leftJoin(profiles, eq(profiles.userId, profiles_actions.actorId))
      .where(whereCondition)
      .orderBy(
        sortOrder === 'asc' ? asc(profiles_actions.actionTime) : desc(profiles_actions.actionTime)
      )
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ count: sql`count(*)` })
      .from(profiles_actions)
      .where(whereCondition)
      .then((result) => Number(result[0]?.count || 0));

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
