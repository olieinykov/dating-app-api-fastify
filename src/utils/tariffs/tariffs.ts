import { and, eq } from 'drizzle-orm';
import { profiles_tariff } from '../../db/schema/profile_tariff.js';
import { tariffs } from '../../db/schema/tariff.js';
import { db } from '../../db/index.js';

export const checkEntriesDailyLimit = async (
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  profileId: number
) => {
  const today = new Date();
  let allowSending = false;
  let entriesSent = 0;

  const [activeTariff] = await tx
    .select({
      id: profiles_tariff.id,
      tariffId: profiles_tariff.tariffId,
      entriesSentToday: profiles_tariff.entriesSentToday,
      entriesDailyLimit: tariffs.entriesDailyLimit,
      lastResetDate: profiles_tariff.lastResetDate,
    })
    .from(profiles_tariff)
    .where(and(eq(profiles_tariff.profileId, profileId), eq(profiles_tariff.isActive, true)))
    .leftJoin(tariffs, eq(tariffs.id, profiles_tariff.tariffId))
    .limit(1);

  if (!activeTariff) {
    throw new Error('Active tariff not found for this profile');
  }

  entriesSent = activeTariff.entriesSentToday ?? 0;
  const lastResetDate = new Date(activeTariff.lastResetDate!);
  if (
    lastResetDate.getDate() !== today.getDate() ||
    lastResetDate.getMonth() !== today.getMonth() ||
    lastResetDate.getFullYear() !== today.getFullYear()
  ) {
    await tx
      .update(profiles_tariff)
      .set({
        entriesSentToday: 0,
        lastResetDate: today,
      })
      .where(
        and(
          eq(profiles_tariff.profileId, profileId),
          eq(profiles_tariff.tariffId, activeTariff.tariffId)
        )
      );

    allowSending = true;
    entriesSent = 0;
  }

  return {
    allowSending: allowSending || entriesSent < (activeTariff?.entriesDailyLimit ?? 0),
    entriesSent,
  };
};
