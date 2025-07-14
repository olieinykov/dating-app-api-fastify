import { FastifyRequest, FastifyReply } from 'fastify';
import { models, profilesPreferences } from '../../../db/schema/index.js';
import { db } from '../../../db/index.js';
import { GetModelsByPreferencesSchemaType } from './schemas.js';
import { isNull, eq, sql } from 'drizzle-orm';

export const getModelsByPreferences = async (
  request: FastifyRequest<GetModelsByPreferencesSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { page, pageSize } = request.query;
    const profileId = request.profileId;

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

    const query = db
      .select({
        id: models.id,
        userId: models.userId,
        name: models.name,
        country: models.country,
        description: models.description,
        avatar: models.avatar,
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
      // .innerJoin(
      //     profilesPreferences,
      //     eq(profilesPreferences.profileId, profileId)
      // )
      .where(isNull(models.deactivatedAt))
      .orderBy(sql`match_score DESC`)
      .limit(limit)
      .offset(offset);

    const [data, total] = await Promise.all([
      query,
      db
        .select({ count: sql<number>`count(*)` })
        .from(models)
        .innerJoin(profilesPreferences, eq(profilesPreferences.profileId, profileId as number))
        .where(isNull(models.deactivatedAt))
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
