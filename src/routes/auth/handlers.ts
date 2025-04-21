import { FastifyRequest, FastifyReply } from 'fastify'
import { isValid, parse } from "@telegram-apps/init-data-node";
import env from "../../config/env.js";
import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
import { profiles, profilesPhotos, profilesPreferences, profilesTelegram } from "../../db/schema/index.js";
import {ActivateProfileSchemaType, LoginSchemaType, RegisterSchemaBodyType} from "./schemas.js";

export const login = async (request: FastifyRequest<LoginSchemaType>, reply: FastifyReply) => {
  const { initData } = request.body;

  const isInitDataValid = isValid(
      initData,
      env.telegram.botToken!
  );

  if (!isInitDataValid) {
    reply.code(400).send({
      success: false,
      data: {
        authStatus: "TG_INIT_DATA_INVALID"
      }
    });
  }

  const telegramId = parse(initData).user?.id;

  if (!telegramId) {
    reply.code(400).send({
      success: false,
      data: {
        authStatus: "TG_INIT_DATA_INVALID"
      }
    });
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.telegramId, telegramId as number),
  });

  if (!profile) {
    reply.code(400).send({
      success: false,
      data: {
        authStatus: "USER_NOT_REGISTERED"
      }
    });
  }

  if (profile && !profile.activatedAt) {
    reply.code(400).send({
      success: false,
      data: {
        authStatus: "USER_REGISTERED_NOT_ACTIVATED",
        user: profile,
      }
    });
  }

  if (profile && profile.activatedAt) {
    reply.code(200).send({
      success: true,
      data: {
        authStatus: "USER_AUTHENTICATED",
        user: profile,
      }
    });
  }

  reply.code(200);
};



export const register = async (
    request: FastifyRequest<RegisterSchemaBodyType>,
    reply: FastifyReply
) => {
  try {
    const isInitDataValid = isValid(
        request.body.initData,
        env.telegram.botToken!
    );

    if (!isInitDataValid) {
      reply.code(400).send({
        success: false,
      });
    }

    const telegramUser = parse(request.body.initData)?.user;

    if (!telegramUser) {
      reply.code(400).send({
        success: false,
      });
    }

    const result = await db.transaction(async (tx) => {
      const [telegramData] = await tx.insert(profilesTelegram).values({
        firstName: telegramUser?.first_name,
        lastName: telegramUser?.last_name,
        telegramName: telegramUser?.username,
        languageCode: telegramUser?.language_code,
        telegramId: telegramUser?.id,
      }).returning();

      const [profileData] = await tx.insert(profiles).values({
        role: 'user',
        name: telegramData.telegramName,
        telegramId: telegramData.telegramId,
      }).returning();

      await tx.insert(profilesPreferences).values({
        profileId: profileData.id
      }).returning();

      return profileData;
    });

    reply.code(200).send({
      success: true,
      data: result,
      message: 'User has been created'
    });
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: (error as Error)?.message,
      message: 'Failed to create a new user'
    })
  }
}

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
            url: photo.url,
            profileId: request.params.profileId,
            order: photo.order,
          }))
          ?.sort((a, b) => a.order - b.order);

      const [profileData] = await db
          .update(profiles)
          .set({
            name: request.body.name,
            avatar: photos?.[0]?.url,
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
              url: profilesPhotos.url,
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
