import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../../db/index.js';
import {
  profiles_actions,
  files,
  profiles,
  profiles_photos,
  profiles_subscriptions,
  profilesPreferences,
  profile_balances,
  profilesTelegram,
  chat_participants,
  chats,
} from '../../../db/schema/index.js';
import { and, asc, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import {
  CreateUserType,
  DeleteUserType,
  ActivateUserType,
  GetAllUsersType,
  GetOneUserType,
  UpdateUsersType,
  GetUserActionsType,
  GetUserDetailsType,
  DeleteUserCompleteType,
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

      const [user] = await tx
        .select()
        .from(profiles)
        .where(eq(profiles.id, request.params.userId))
        .limit(1);

      if (!user) {
        throw new Error(`No user found with id: ${request.params.userId}`);
      }

      if (request.body.password) {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          user.userId as string,
          {
            password: request.body.password,
          }
        );
        if (authError) {
          throw new Error(`Failed to update password: ${authError.message}`);
        }
      }
      const { password, ...profileUpdateData } = request.body;

      const [updatedUser] = await tx
        .update(profiles)
        .set(profileUpdateData as any)
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

export const getUserDetails = async (
  request: FastifyRequest<GetUserDetailsType>,
  reply: FastifyReply
) => {
  try {
    const userId = request.params.userId;

    const [profileData] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);

    if (!profileData) {
      throw new Error();
    }

    const [profileDetails] = await db
      .select()
      .from(profilesPreferences)
      .where(eq(profilesPreferences.profileId, profileData.id))
      .limit(1);

    const photos = await db
      .select({
        id: profiles_photos.fileId,
        url: files.url,
        isAvatar: profiles_photos.isAvatar,
      })
      .from(profiles_photos)
      .where(eq(profiles_photos.profileId, profileData.id))
      .leftJoin(files, eq(files.id, profiles_photos.fileId));

    const [balanceRow] = await db
      .select({ balance: profile_balances.balance })
      .from(profile_balances)
      .where(eq(profile_balances.profileId, profileData.id))
      .limit(1);

    const [profileSubscription] = await db
      .select()
      .from(profiles_subscriptions)
      .where(eq(profiles_subscriptions.profileId, profileData.id))
      .limit(1);

    const now = new Date();
    const isExpired = !profileSubscription.expirationAt || profileSubscription.expirationAt < now;

    reply.code(200).send({
      ...profileData,
      subscription: {
        expirationAt: profileSubscription.expirationAt,
        isExpired,
      },
      profile: {
        ...profileDetails,
        balance: balanceRow.balance,
        photos,
      },
    });
  } catch (error) {
    reply.code(404).send({
      success: false,
      message: 'User not found',
      error: (error as Error)?.message,
    });
  }
};

export const deleteUserComplete = async (
  request: FastifyRequest<DeleteUserCompleteType>,
  reply: FastifyReply
) => {
  try {
    const profileId = request.params.userId;

    const [existingUser] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .limit(1);

    if (!existingUser) {
      return reply.code(404).send({
        success: false,
        message: 'User not found',
      });
    }

    const telegramId = existingUser.telegramId;
    const userId = existingUser.userId;

    const chatIds = await db
      .select({ id: chat_participants.chatId })
      .from(chat_participants)
      .where(eq(chat_participants.userId, userId as string));

    const data = await db.transaction(async (tx) => {
      for (const chatId of chatIds) {
        await tx.delete(chats).where(eq(chats.id, chatId.id));
      }

      const [deletedProfile] = await tx
        .delete(profiles)
        .where(eq(profiles.id, profileId as number))
        .returning();

      if (telegramId !== null && telegramId !== undefined) {
        await tx
          .delete(profilesTelegram)
          .where(eq(profilesTelegram.telegramId, telegramId as number));
      }

      if (userId) {
        try {
          const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId as string);
          if (authError) {
            throw new Error(`Auth deletion failed: ${authError.message}`);
          }
        } catch (authError) {
          throw new Error(`Auth deletion failed: ${authError as Error}`);
        }
      }

      return deletedProfile;
    });

    return reply.code(200).send({
      success: true,
      data,
    });
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: (error as Error)?.message,
    });
  }
};
