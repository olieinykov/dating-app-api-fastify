import { FastifyRequest, FastifyReply } from 'fastify';
import { BuyTariffSchemaType } from './schemas.js';
import { db } from "../../../db";
import { tariffs } from "../../../db/schema/tariff";
import { eq } from "drizzle-orm";
import { profile_balances } from "../../../db/schema/profile_balances";
import { profiles_subscriptions } from "../../../db/schema";

export const getTariffs = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
  try {
    const data = await db.select().from(tariffs);
    reply.code(200).send({
      success: true,
      data,
    });
  } catch (error) {
    reply.code(404).send({
      success: false,
      message: 'Failed to get tariffs',
    });
  }
};

export const buyTariff = async (
  request: FastifyRequest<BuyTariffSchemaType>,
  reply: FastifyReply
) => {
  try {
    const data = await db.transaction(async (tx) => {
      const { tariffId } = request.body;
      const [tariff] = await tx.select().from(tariffs).where(eq(tariffs.id, tariffId)).limit(1);

      if (!tariff) {
        reply.code(404).send({
          success: false,
          message: 'Tariff not found',
        });
      }


      const tariffPrice = tariff.price;
      const tariffDays = tariff.daysPeriod;
      // console.log("buyTariff", tariffId);
      console.log("price", tariffPrice);

      const [profileBalance] = await tx
          .select({ balance: profile_balances.balance })
          .from(profile_balances)
          .where(eq(profile_balances.profileId, request.profileId as number))
          .limit(1);

      if (!profileBalance?.balance || tariffPrice > profileBalance.balance) {
        reply.code(500).send({
          success: false,
          message: 'Insufficient funds on balance',
        });
      }

      await tx
          .update(profile_balances)
          .set({ balance: profileBalance.balance - tariffPrice })
          .where(eq(profile_balances.profileId, request.profileId as number));

      const [currentSubscription] = await db.select().from(profiles_subscriptions).where(eq(profiles_subscriptions.profileId, request.profileId));

      const currentExpirationAt = currentSubscription.expirationAt;
      const now = new Date();
      let expirationAt = new Date();

      if (currentExpirationAt && currentExpirationAt > now) {
        expirationAt = new Date(currentExpirationAt);
        expirationAt.setDate(expirationAt.getDate() + tariffDays);
      } else {
        expirationAt.setDate(now.getDate() + tariffDays);
      }

      const [data] = await tx.update(profiles_subscriptions)
          .set({
            profileId: request.profileId,
            isTrial: false,
            prolongedAt: new Date(),
            expirationAt,
          })
          .where(eq(profiles_subscriptions.profileId, request.profileId)).returning();

      return data;
    })

    reply.code(200).send({
      success: true,
      data: data,
    });
  } catch (error) {
    reply.code(404).send({
      success: false,
      message: 'Failed to buy tariff',
    });
  }
};