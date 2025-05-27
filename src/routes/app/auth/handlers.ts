import { FastifyRequest, FastifyReply } from 'fastify'
import { isValid, parse } from "@telegram-apps/init-data-node";
import env from "../../../config/env.js";
import { db } from "../../../db/index.js";
import { eq } from "drizzle-orm";
import { profiles, profilesPhotos, profilesPreferences, profilesTelegram } from "../../../db/schema/index.js";
import { ActivateProfileSchemaType, LoginSchemaType } from "./schemas.js";
import { supabase, supabaseAdmin } from "../../../services/supabase.js";
import { CookieSerializeOptions } from "@fastify/cookie";

export const createOrLogin = async (request: FastifyRequest<LoginSchemaType>, reply: FastifyReply) => {
  const telegram = request.body;

  console.log("telegram", telegram)

  const email = `${telegram.id}.mock@amorium.com`;
  const password = "TEST_MOCK_PASSWORD";

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.telegramId, telegram?.id as number),
  });

  if (profile && !profile.activatedAt) {
    return reply.code(200).send({
      success: true,
      data: {
        authStatus: "USER_REGISTERED_NOT_ACTIVATED",
        user: profile,
      }
    });
  }

  if (profile && profile.activatedAt) {
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !sessionData.session) {
      return reply.status(401).send({ success: false, error: "USER_ACTIVATED_LOGIN_FAILED" });
    }

    const accessToken = sessionData.session.access_token;
    const refreshToken = sessionData.session.refresh_token;

    const cookieOptions: CookieSerializeOptions = {
      path: '/',
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: true,
      sameSite: 'none',
    };

    reply
        .setCookie('userAccessToken', accessToken, { ...cookieOptions, maxAge: 60 * 60 })
        .setCookie('adminRefreshToken', refreshToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
    return reply.code(200).send({
      success: true,
      data: {
        authStatus: "USER_AUTHENTICATED",
        user: profile,
      }
    });
  }


  if (!profile) {
    const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        telegram_id: telegram.id,
      }
    })

    if (createUserError) {
      throw new Error()
    }

    try {
      const result = await db.transaction(async (tx) => {
        const [telegramData] = await tx.insert(profilesTelegram).values({
          firstName: telegram?.first_name,
          lastName: telegram?.last_name,
          telegramName: telegram?.username,
          languageCode: telegram?.language_code,
          telegramId: telegram?.id,
        }).returning();

        const [profileData] = await tx.insert(profiles).values({
          role: 'user',
          name: telegramData.telegramName,
          userId: createdUser.user?.id,
          telegramId: telegramData.telegramId,
        }).returning();

        await tx.insert(profilesPreferences).values({
          profileId: profileData.id
        }).returning();

        return profileData;
      });

      return reply.code(200).send({
        success: true,
        data: {
          authStatus: "USER_REGISTERED_NOT_ACTIVATED",
          user: result,
        }
      });
    } catch (error) {
      await supabaseAdmin.auth.admin.deleteUser(createdUser.user?.id!);
      return reply.code(200).send({
        success: false,
        data: {
          success: false,
          message: "Failed to handle login",
          error,
        }
      });
    }
  }
};


export const activateProfile = async (
    request: FastifyRequest<ActivateProfileSchemaType>,
    reply: FastifyReply
) => {
  try {
    const [existingProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, request.params.profileId))
        .limit(1);

    if (!existingProfile) {
      reply.code(404).send({
        success: false,
        message: `There is no user with id = ${request.params.profileId}`,
      });
      return;
    }

    const result = await db.transaction(async (tx) => {
      const photos = request.body.photos
          ?.map((photo) => ({
            fileId: photo.fileId,
            profileId: request.params.profileId,
            order: photo.order,
          }))
          ?.sort((a, b) => a.order - b.order);

      const [profileData] = await db
          .update(profiles)
          .set({
            name: request.body.name,
            avatarFileId: photos?.[0]?.fileId,
            activatedAt: new Date(),
          })
          .where(eq(profiles.id, request.params.profileId))
          .returning();

      const [profileDetails] = await db
          .update(profilesPreferences)
          .set({
            about: request.body.about,
            profileId: request.params.profileId,
            dateOfBirth: request.body.dateOfBirth,
            gender: request.body.gender,
            hobbies: request.body.hobbies,
            city: request.body.city,
            paramsAge: request.body.paramsAge,
            paramsBustSize: request.body.paramsBustSize,
            paramsHairColor: request.body.paramsHairColor,
            paramsBodyType: request.body.paramsBodyType,
          })
          .where(eq(profilesPreferences.profileId, request.params.profileId))
          .returning();

      let profilePhotos = undefined;
      if (photos?.length) {
        await tx
            .delete(profilesPhotos)
            .where(eq(profilesPhotos.profileId, request.params.profileId));
        profilePhotos = await tx
            .insert(profilesPhotos)
            .values(photos)
            .returning({
              id: profilesPhotos.id,
              order: profilesPhotos.order,
              fileId: profilesPhotos.fileId,
            });
      }

      return {
        ...profileData,
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
      message: "Failed to activate profile",
    });
  }
};
