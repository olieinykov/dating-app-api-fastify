import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from "../../../db/index.js";
import { eq } from "drizzle-orm";
import { profiles, profilesPreferences, profilesTelegram } from "../../../db/schema/index.js";
import { ActivateProfileSchemaType, LoginSchemaType } from "./schemas.js";
import { supabase, supabaseAdmin } from "../../../services/supabase.js";
import { CookieSerializeOptions } from "@fastify/cookie";
import {updateProfilePhotos} from "../../../utils/files/files.js";
import { profile_balances } from "../../../db/schema/profile_balances.js";
import env from "../../../config/env.js";
import { isValid, parse } from "@telegram-apps/init-data-node";

export const createOrLogin = async (request: FastifyRequest<LoginSchemaType>, reply: FastifyReply) => {
  let telegram = undefined;
  let isInitDataValid = undefined;

  if (request.body.bypassData) {
     telegram = request.body.bypassData;
  } else {
     isInitDataValid = isValid(request.body.initData!, env.telegram.botToken!);
     telegram = isInitDataValid ? parse(request.body.initData ?? "").user : null;
  }

  console.log("Init data:", request.body.initData);
  console.log("botToken:", env.telegram.botToken);
  console.log("telegram:", telegram);
  console.log("bypassData:", request.body.bypassData);

  if (isInitDataValid === false || !telegram?.id) {
    throw new Error("Failed to handle telegram data")
  }

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

    let cookieOptions: CookieSerializeOptions = {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    }

    if (request.body.bypassData) {
      cookieOptions = {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      }
    }

    reply
        .setCookie('userAccessToken', accessToken, { ...cookieOptions, maxAge: env.appConfig.userTokenExpirationTime, })
        .setCookie('userRefreshToken', refreshToken, { ...cookieOptions, maxAge: env.appConfig.userRefreshTokenExpirationTime, });
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

        await tx.insert(profile_balances).values({
          profileId: profileData.id,
          balance: 0,
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

      const [profileData] = await db
          .update(profiles)
          .set({
            name: payload.name,
            avatar: profilePhotos?.find(photo => photo?.isAvatar === true)?.url,
            activatedAt: new Date(),
          })
          .where(eq(profiles.id, existingProfile.id))
          .returning();

      const [profileDetails] = await db
          .update(profilesPreferences)
          .set({
            about: payload.about,
            // profileId: request.params.profileId,
            dateOfBirth: payload.dateOfBirth,
            gender: payload.gender,
            hobbies: payload.hobbies,
            city: payload.city,
            paramsAge: payload.paramsAge,
            paramsBustSize: payload.paramsBustSize,
            paramsHairColor: payload.paramsHairColor,
            paramsBodyType: payload.paramsBodyType,
          })
          .where(eq(profilesPreferences.profileId, existingProfile.id))
          .returning();

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
