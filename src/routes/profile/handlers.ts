import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/index.js";
import {
  ActivateProfileSchemaType,
  GetProfileSchemaType,
  UpdateProfileSchemaType,
} from "./schemas";
import { profiles, profilesPhotos, profilesPreferences } from "../../db/schema/index.js";
import { eq } from "drizzle-orm";

export const getProfile = async (
  request: FastifyRequest<GetProfileSchemaType>,
  reply: FastifyReply
) => {
  try {
    if (!request.params.profileId) {
      return reply.code(404).send({
        success: false,
        message: "Profile not found",
      });
    }

    const [profileData] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, request.params.profileId))
      .limit(1);

    if (!profileData) {
      return reply.code(404).send({
        success: false,
        message: "Profile not found",
      });
    }

    const [profileDetails] = await db
      .select()
      .from(profilesPreferences)
      .where(eq(profilesPreferences.profileId, request.params.profileId))
      .limit(1);

    const photos = await db
      .select({
        id: profilesPhotos.id,
        url: profilesPhotos.url,
        order: profilesPhotos.order,
      })
      .from(profilesPhotos)
      .where(eq(profilesPhotos.profileId, request.params.profileId));

    reply.code(200).send({
      ...profileData,
      profile: {
        ...profileDetails,
        photos,
      },
    });
  } catch (error) {
    reply.code(404).send({
      success: false,
      message: "User not found",
    });
  }
};

export const updateProfile = async (
  request: FastifyRequest<UpdateProfileSchemaType>,
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
    }

    if (existingProfile.activatedAt) {
      reply.code(400).send({
        success: false,
        message: `User with id = ${request.params.profileId} has already been activated`,
      });
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
