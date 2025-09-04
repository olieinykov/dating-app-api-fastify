import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../../db/index.js';
import { eq } from 'drizzle-orm';
import {
  profiles,
  profilesPreferences,
  profilesTelegram,
  profiles_subscriptions,
} from '../../../db/schema/index.js';
import { ActivateProfileSchemaType, LoginSchemaType } from './schemas.js';
import { supabase, supabaseAdmin } from '../../../services/supabase.js';
import { updateProfilePhotos } from '../../../utils/files/files.js';
import { profile_balances } from '../../../db/schema/profile_balances.js';
import env from '../../../config/env.js';
import { isValid, parse } from '@telegram-apps/init-data-node';

export const createOrLogin = async (
  request: FastifyRequest<LoginSchemaType>,
  reply: FastifyReply
) => {
  try {
    let telegram = null;
    let isInitDataValid = false;

    if (request.body.bypassData) {
      console.log("[DEBUG AUTH]: BYPASS DATA:", request.body.bypassData);
      telegram = request.body.bypassData;
      isInitDataValid = true;
    } else {

      console.log("[DEBUG AUTH]: INIT DATA:", request.body.initData);
      isInitDataValid = isValid(request.body.initData!, env.telegram.botToken!);
      console.log("[DEBUG AUTH]: IS VALID:", isInitDataValid);
      telegram = isInitDataValid ? parse(request.body.initData ?? '').user : null;
      console.log("[DEBUG AUTH]: TG DATA:", telegram);
    }

    if (!isInitDataValid || !telegram?.id) {
      return reply.code(400).send({ success: false, error: 'Invalid Telegram data' });
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.telegramId, telegram.id!),
    });

    if (profile && !profile.activatedAt) {
      console.log("[DEBUG AUTH]: REGISTERED NOT ACTIVATED:", profile);
      return reply.code(200).send({
        success: true,
        data: {
          authStatus: 'USER_REGISTERED_NOT_ACTIVATED',
          user: profile,
        },
      });
    }

    if (profile && profile.activatedAt) {
      console.log("[DEBUG AUTH]: ACTIVATED:", profile);
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email: `${telegram.id}.mock@amorium.com`,
        password: 'TEST_MOCK_PASSWORD',
      });

      if (signInError || !sessionData?.session) {
        console.log("[DEBUG AUTH]: SIGN IN ERROR:", signInError);
        return reply.status(401).send({
          success: false,
          error: 'USER_ACTIVATED_LOGIN_FAILED',
        });
      }

      console.log("[DEBUG AUTH]: CREATED SESSION:", sessionData.session.access_token);

      return reply.code(200).send({
        success: true,
        data: {
          accessToken: sessionData.session.access_token,
          refreshToken: sessionData.session.refresh_token,
          expiresIn: env.appConfig.adminTokenExpirationTime,
          authStatus: 'USER_AUTHENTICATED',
          user: profile,
        },
      });
    }

    const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser(
      {
        email: `${telegram.id}.mock@amorium.com`,
        password: 'TEST_MOCK_PASSWORD',
        email_confirm: true,
        user_metadata: {
          telegram_id: telegram.id,
        },
      }
    );

    if (createUserError) {
      console.log("[DEBUG AUTH]: CREATED USER ERROR:", createUserError);
      throw createUserError;
    }

    try {
      const result = await db.transaction(async (tx) => {
        const [telegramData] = await tx
          .insert(profilesTelegram)
          .values({
            firstName: telegram?.first_name,
            lastName: telegram?.last_name,
            telegramName: telegram?.username,
            languageCode: telegram?.language_code,
            telegramId: telegram?.id,
          })
          .returning();

        const [profileData] = await tx
          .insert(profiles)
          .values({
            role: 'user',
            name: telegramData.telegramName,
            userId: createdUser.user?.id,
            telegramId: telegramData.telegramId,
          })
          .returning();

        await tx
          .insert(profilesPreferences)
          .values({
            profileId: profileData.id,
          })
          .returning();

        await tx
          .insert(profile_balances)
          .values({
            profileId: profileData.id,
            balance: 0,
          })
          .returning();

        return profileData;
      });

      return reply.code(200).send({
        success: true,
        data: {
          authStatus: 'USER_REGISTERED_NOT_ACTIVATED',
          user: result,
        },
      });
    } catch (error) {
      console.log("[DEBUG AUTH]: TRANSACTION ERROR:", error);
      if (createdUser?.user?.id) {
        await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
      }
      throw error;
    }
  } catch (error) {

    console.log("[DEBUG AUTH]: ERROR:", error);
    return reply.code(200).send({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const activateProfile = async (
  request: FastifyRequest<ActivateProfileSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { photos, ...payload } = request.body;

    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, request.params.profileId))
      .limit(1);

    if (!existingProfile) {
      throw new Error();
    }

    const result = await db.transaction(async (tx) => {
      let profilePhotos = undefined;

      if (photos?.length) {
        profilePhotos = await updateProfilePhotos(tx, existingProfile.id, photos);
      }

      const [profileData] = await tx
        .update(profiles)
        .set({
          name: payload.name,
          avatar: profilePhotos?.find((photo) => photo?.isAvatar === true)?.url,
          activatedAt: new Date(),
        })
        .where(eq(profiles.id, existingProfile.id))
        .returning();

      const [profileDetails] = await tx
        .update(profilesPreferences)
        .set({
          about: payload.about,
          // profileId: request.params.profileId,
          dateOfBirth: payload.dateOfBirth,
          gender: payload.gender,
          hobbies: payload.hobbies?.length ? payload.hobbies : [],
          city: payload.city,
          paramsAge: payload.paramsAge,
          paramsBustSize: payload.paramsBustSize,
          paramsHairColor: payload.paramsHairColor,
          paramsBodyType: payload.paramsBodyType,
        })
        .where(eq(profilesPreferences.profileId, existingProfile.id))
        .returning();

      const expirationDate = new Date();
      // const tariffTime = 5 * 60 * 1000;
      const tariffTime = 24 * 60 * 60 * 1000;
      expirationDate.setTime(expirationDate.getTime() + tariffTime);

      const [trialSubscription] = await tx
        .insert(profiles_subscriptions)
        .values({
          profileId: profileData.id,
          isTrial: true,
          expirationAt: expirationDate,
        })
        .returning();

      return {
        ...profileData,
        subscription: {
          expirationAt: trialSubscription.expirationAt,
          isExpired: false,
        },
        profile: {
          ...profileDetails,
          photos: profilePhotos,
        },
      };
    });

    return reply.code(200).send(result);
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: (error as Error).message,
      message: 'Failed to activate profile',
    });
  }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.userId!;
  try {
    console.log("LOGOUT: userId", userId);
    console.log("LOGOUT: user", JSON.stringify(request?.profile ?? {}));
    await db.transaction(async (tx) => {
      await tx
          .update(profiles)
          .set({ lastActiveTime: new Date() })
          .where(eq(profiles.userId, userId));

      await supabaseAdmin.auth.admin.signOut(userId);
    });

    return reply.code(200).send({ success: true, message: 'Logged out' });
  } catch (error) {
    console.log("LOGOUT: error", error);
    reply.code(400).send({
      success: false,
      error: (error as Error).message,
    });
  }
};
