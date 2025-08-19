import { FastifyRequest, FastifyReply } from 'fastify';
import {
  models,
  models_photos,
  profilesPreferences,
  disliked_models,
  chat_participants,
  files,
} from '../../../db/schema/index.js';
import { db } from '../../../db/index.js';
import { GetModelsByPreferencesSchemaType, DislikeModelSchemaType } from './schemas.js';
import { isNull, eq, sql, inArray, and, notInArray } from 'drizzle-orm';

export const getModelsByPreferences = async (
  request: FastifyRequest<GetModelsByPreferencesSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { page, pageSize } = request.query;
    const profileId = request.profileId;
    const userId = request.userId;

    const currentPage = Math.max(1, Number(page));
    const limit = Math.min(100, Math.max(1, Number(pageSize)));
    const offset = (currentPage - 1) * limit;

    const [preferences] = await db
      .select()
      .from(profilesPreferences)
      .where(eq(profilesPreferences.profileId, profileId as number))
      .limit(1);

    const SCORING_SQL = {
      age: sql`CASE 
                WHEN ${models.age} BETWEEN 18 AND 24 AND ${preferences.paramsAge} = '18-24' THEN 30
                WHEN ${models.age} BETWEEN 25 AND 34 AND ${preferences.paramsAge} = '25-34' THEN 30
                WHEN ${models.age} BETWEEN 35 AND 44 AND ${preferences.paramsAge} = '35-44' THEN 30
                WHEN ${models.age} >= 45 AND ${preferences.paramsAge} = '45+' THEN 30
                ELSE 0
                 END`,
      bustSize: sql`CASE WHEN ${models.bustSize} = ${preferences.paramsBustSize} THEN 25 ELSE 0 END`,
      hairColor: sql`CASE WHEN ${models.hairColor} = ${preferences.paramsHairColor} THEN 20 ELSE 0 END`,
      bodyType: sql`CASE WHEN ${models.bodyType} = ${preferences.paramsBodyType} THEN 20 ELSE 0 END`,
      country: sql`CASE WHEN ${models.country} = ${preferences.country} THEN 5 ELSE 0 END`,
    };

    const likedModelsIds = await db
      .select({ userId: chat_participants.userId })
      .from(chat_participants)
      .where(
        inArray(
          chat_participants.chatId,
          db
            .select({ chatId: chat_participants.chatId })
            .from(chat_participants)
            .where(eq(chat_participants.userId, userId as string))
        )
      );

    const excludedModelsIds = likedModelsIds.map((m) => m.userId);

    const dislikedModelsIds = await db
      .select({ modelId: disliked_models.modelId })
      .from(disliked_models)
      .where(eq(disliked_models.profileId, profileId as number));

    const dislikedIds = dislikedModelsIds.map((m) => m.modelId);

    const orderByDislike = sql`CASE WHEN ${models.id} IN (${sql.join(dislikedIds, sql`, `)}) THEN 1 ELSE 0 END`;
    const orderByArr = dislikedIds.length
      ? [orderByDislike, sql`match_score DESC`]
      : [sql`match_score DESC`];

    const photosSubquery = db
      .select({
        modelId: models_photos.modelId,
        fileUrls: sql`array_agg(${files.url})`.as('file_urls'),
      })
      .from(models_photos)
      .innerJoin(files, eq(files.id, models_photos.fileId))
      .where(eq(models_photos.isAvatar, false))
      .groupBy(models_photos.modelId)
      .as('photos_subquery');

    const query = db
      .select({
        id: models.id,
        userId: models.userId,
        name: models.name,
        country: models.country,
        description: models.description,
        avatar: models.avatar,
        photos: photosSubquery.fileUrls,
        age: models.age,
        gender: models.gender,
        bustSize: models.bustSize,
        hairColor: models.hairColor,
        bodyType: models.bodyType,
        createdAt: models.createdAt,
        updatedAt: models.updatedAt,
        // ...models,
        matchScore: sql<number>`
                    ${SCORING_SQL.age} + 
                    ${SCORING_SQL.bustSize} + 
                    ${SCORING_SQL.hairColor} + 
                    ${SCORING_SQL.bodyType} + 
                    ${SCORING_SQL.country}
                `.as('match_score'),
      })
      .from(models)
      .leftJoin(photosSubquery, eq(photosSubquery.modelId, models.id))
      // .innerJoin(
      //     profilesPreferences,
      //     eq(profilesPreferences.profileId, profileId)
      // )
      .where(and(isNull(models.deactivatedAt), notInArray(models.userId, excludedModelsIds)))
      .orderBy(...orderByArr)
      .limit(limit)
      .offset(offset);

    const [data, total] = await Promise.all([
      query,
      db
        .select({ count: sql<number>`count(*)` })
        .from(models)
        .innerJoin(profilesPreferences, eq(profilesPreferences.profileId, profileId as number))
        .where(and(isNull(models.deactivatedAt), notInArray(models.userId, excludedModelsIds)))
        .then((res) => res[0]?.count ?? 0),
    ]);

    reply.send({
      status: 'success',
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
      status: 'error',
      error: (error as Error)?.message,
    });
  }
};

export const dislikeModel = async (
  request: FastifyRequest<DislikeModelSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { modelId } = request.params;
    const profileId = request.profileId;

    const existingDislike = await db
      .select()
      .from(disliked_models)
      .where(
        and(
          eq(disliked_models.profileId, profileId as number),
          eq(disliked_models.modelId, modelId as number)
        )
      );

    if (existingDislike.length > 0) {
      reply.send({
        status: 'success',
        data: existingDislike[0],
      });
      return;
    }

    const [dislikedModel] = await db
      .insert(disliked_models)
      .values({
        profileId: profileId as number,
        modelId,
      })
      .returning();

    reply.send({
      status: 'success',
      data: dislikedModel,
    });
  } catch (error) {
    reply.status(400).send({
      status: 'error',
      error: (error as Error)?.message,
    });
  }
};
