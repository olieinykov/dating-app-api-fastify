import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../../db/index.js';
import { UpdateProfileSchemaType } from './schemas.js';
import { files, profiles, profiles_photos, profilesPreferences } from '../../../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { updateProfilePhotos } from '../../../utils/files/files.js';
import { profile_balances } from '../../../db/schema/profile_balances.js';
import { profiles_tariff } from '../../../db/schema/profile_tariff.js';
import { tariffs } from '../../../db/schema/tariff.js';

export const getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
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
      .where(eq(profile_balances.profileId, profileData.id as number))
      .limit(1);

    const [activeTariff] = await db
      .select({
        tariff: tariffs,
        entriesSentToday: profiles_tariff.entriesSentToday,
      })
      .from(profiles_tariff)
      .where(
        and(eq(profiles_tariff.profileId, profileData.id!), eq(profiles_tariff.isActive, true))
      )
      .leftJoin(tariffs, eq(tariffs.id, profiles_tariff.tariffId))
      .limit(1);

    reply.code(200).send({
      ...profileData,
      tariff: {
        ...activeTariff?.tariff,
        entriesSentToday: activeTariff?.entriesSentToday ?? 0,
      },
      profile: {
        ...profileDetails,
        balance: balanceRow.balance,
        photos,
      },
    });
  } catch (error) {
    console.log('error', error);
    reply.code(404).send({
      success: false,
      message: 'User not found',
    });
  }
};

export const updateProfile = async (
  request: FastifyRequest<UpdateProfileSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { photos, ...payload } = request.body;
    const userId = request.userId;
    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId as string))
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
          avatar: profilePhotos?.find((photo) => photo?.isAvatar === true)?.url,
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

      const [balanceRow] = await tx
        .select({ balance: profile_balances.balance })
        .from(profile_balances)
        .where(eq(profile_balances.profileId, existingProfile.id as number))
        .limit(1);

      return {
        ...profileData,
        profile: {
          ...profileDetails,
          balance: balanceRow.balance,
          photos: profilePhotos,
        },
      };
    });

    reply.code(200).send(result);
  } catch (error) {
    reply.code(400).send({
      success: false,
      error: (error as Error).message,
      message: 'Failed to update profile',
    });
  }
};
