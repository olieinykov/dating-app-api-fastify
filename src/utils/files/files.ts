import { db } from '../../db';
import { models_photos } from '../../db/schema/model_photos.js';
import { eq } from 'drizzle-orm';
import { ProfileFile } from './type';
import { files, profiles_photos } from '../../db/schema/index.js';

export const updateModelPhotos = async (
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  modelId: number,
  photos: ProfileFile[]
) => {
  const photosValues = photos.map((file) => ({
    modelId: modelId,
    fileId: file.id,
    isAvatar: file.isAvatar,
  }));
  await tx.delete(models_photos).where(eq(models_photos.modelId, modelId)).returning();
  await tx.insert(models_photos).values(photosValues).returning();

  return tx
    .select({
      id: files.id,
      url: files.url,
      isAvatar: models_photos.isAvatar,
    })
    .from(models_photos)
    .where(eq(models_photos.modelId, modelId))
    .leftJoin(files, eq(models_photos.fileId, files.id));
};

export const updateProfilePhotos = async (
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  profileId: number,
  photos: ProfileFile[]
) => {
  const photosValues = photos.map((file) => ({
    profileId: profileId,
    fileId: file.id,
    isAvatar: file.isAvatar,
  }));

  await tx.delete(profiles_photos).where(eq(profiles_photos.profileId, profileId));
  await tx.insert(profiles_photos).values(photosValues).returning();

  return tx
    .select({
      id: files.id,
      url: files.url,
      isAvatar: profiles_photos.isAvatar,
    })
    .from(profiles_photos)
    .where(eq(profiles_photos.profileId, profileId))
    .leftJoin(files, eq(profiles_photos.fileId, files.id));
};
