import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../../db/index.js";
import { UpdateProfileSchemaType } from "./schemas.js";
import { files, profiles, profilesPhotos, profilesPreferences } from "../../../db/schema/index.js";
import { eq } from "drizzle-orm";

export const getProfile = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userId = request.userId;

    const [profileData] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId as string))
      .limit(1);

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
        id: profilesPhotos.id,
        url: files.url,
        order: profilesPhotos.order,
      })
      .from(profilesPhotos)
      .where(eq(profilesPhotos.profileId, profileData.id))
      .leftJoin(files, eq(files.id, profilesPhotos.fileId))

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
    const userId = request.userId;
      if (!userId) {
          throw new Error("userId is required");
      }

    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId as string))
      .limit(1);

    if (!existingProfile) {
        throw new Error();
    }

    const result = await db.transaction(async (tx) => {
      const photos = request.body.photos
        ?.map((photo) => ({
          fileId: photo.fileId,
          profileId: existingProfile.id,
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
        .where(eq(profiles.id, existingProfile.id))
        .returning();

      const [profileDetails] = await db
        .update(profilesPreferences)
        .set({
          about: request.body.about,
          // profileId: request.params.profileId,
          dateOfBirth: request.body.dateOfBirth,
          gender: request.body.gender,
          hobbies: request.body.hobbies,
          city: request.body.city,
          paramsAge: request.body.paramsAge,
          paramsBustSize: request.body.paramsBustSize,
          paramsHairColor: request.body.paramsHairColor,
          paramsBodyType: request.body.paramsBodyType,
        })
        .where(eq(profilesPreferences.profileId, existingProfile.id))
        .returning();

      let profilePhotos = undefined;
      if (photos !== undefined) {
        await tx
          .delete(profilesPhotos)
          .where(eq(profilesPhotos.profileId, existingProfile.id));
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

    reply.code(200).send(result);
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: (error as Error).message,
      message: "Failed to activate profile",
    });
  }
};