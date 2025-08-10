import { FastifyRequest, FastifyReply } from 'fastify';
import {
  chat_entries,
  chat_entries_unread,
  model_gifts,
  models,
  profiles,
} from '../../../db/schema/index.js';
import { db } from '../../../db/index.js';
import {
  GetGiftsSentFromMeSchemaType,
  GetModelFavoritesSchemaType,
  SendGiftsToModelSchemaType,
} from './schemas.js';
import { gifts } from '../../../db/schema/gift.js';
import { and, eq } from 'drizzle-orm';
import { profile_gift_transactions } from '../../../db/schema/profile_gift_transactions.js';
import { profile_balances } from '../../../db/schema/profile_balances.js';
import ablyClient from '../../../services/ably.js';
import { transactions } from '../../../db/schema/transaction.js';

export const getGifts = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await db.select().from(gifts);

    return reply.send({
      status: 'success',
      data,
    });
  } catch (error) {
    reply.status(400).send({
      status: 'error',
      error: (error as Error)?.message,
    });
  }
};

export const getModelFavoriteGifts = async (
  request: FastifyRequest<GetModelFavoritesSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { modelId } = request.params;

    const data = await db
      .select({
        id: gifts.id,
        title: gifts.title,
        price: gifts.price,
        image: gifts.image,
        createdAt: gifts.createdAt,
        updatedAt: gifts.updatedAt,
      })
      .from(model_gifts)
      .where(eq(model_gifts.modelId, modelId!))
      .innerJoin(gifts, eq(model_gifts.giftId, gifts.id));

    return reply.send({
      status: 'success',
      data,
    });
  } catch (error) {
    reply.status(400).send({
      status: 'error',
      error: (error as Error)?.message,
    });
  }
};

export const getGiftsSentFromMe = async (
  request: FastifyRequest<GetGiftsSentFromMeSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { modelId } = request.params;
    const profileId = request.profileId;

    const data = await db
      .select({
        id: gifts.id,
        title: gifts.title,
        price: gifts.price,
        image: gifts.image,
        createdAt: gifts.createdAt,
        updatedAt: gifts.updatedAt,
      })
      .from(profile_gift_transactions)
      .where(
        and(
          eq(profile_gift_transactions.profileId, profileId as number),
          eq(profile_gift_transactions.modelId, modelId as number)
        )
      )
      .innerJoin(gifts, eq(profile_gift_transactions.giftId, gifts.id))
      .groupBy(gifts.id);

    return reply.send({
      status: 'success',
      data,
    });
  } catch (error) {
    reply.status(400).send({
      status: 'error',
      error: (error as Error)?.message,
    });
  }
};

export const sendGiftToModel = async (
  request: FastifyRequest<SendGiftsToModelSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { giftId, modelId, chatId, localEntryId } = request.body;

    const profileId = request.profileId;
    const profileUserId = request.userId;

    const [model] = await db
      .select()
      .from(models)
      .where(eq(models.id, modelId as number))
      .limit(1);
    const [gift] = await db
      .select()
      .from(gifts)
      .where(eq(gifts.id, giftId as number))
      .limit(1);

    if (!model || !gift) {
      throw new Error();
    }

    const data = await db.transaction(async (tx) => {
      const [balanceRow] = await tx
        .select({ balance: profile_balances.balance })
        .from(profile_balances)
        .where(eq(profile_balances.profileId, profileId as number))
        .limit(1);

      const balance = balanceRow?.balance ?? 0;
      const giftPrice = gift.price ?? 0;

      if (balance < giftPrice) {
        throw new Error('Insufficient balance');
      }

      await tx
        .update(profile_balances)
        .set({ balance: balance - giftPrice })
        .where(eq(profile_balances.profileId, profileId as number));

      // await tx.insert(profile_gift_transactions).values({
      //   profileId,
      //   modelId,
      //   giftId,
      //   price: giftPrice,
      // });

      await tx
        .insert(transactions)
        .values({
          profileId,
          giftId,
          modelId,
          status: 'completed',
          type: 'gift',
        })
        .returning();

      const [newEntry] = await tx
        .insert(chat_entries)
        .values({
          chatId: chatId,
          senderId: profileUserId as string,
          type: 'gift',
          giftId: gift.id,
        })
        .returning();

      await tx
        .insert(chat_entries_unread)
        .values({
          userId: model.userId,
          chatId: newEntry.chatId,
          chatEntryId: newEntry.id,
        })
        .onConflictDoNothing();

      const [entryWithSender] = await tx
        .select({
          id: chat_entries.id,
          type: chat_entries.type,
          chatId: chat_entries.chatId,
          gift: {
            id: gifts.id,
            title: gifts.title,
            price: gifts.price,
            image: gifts.image,
          },
          sender: {
            id: profiles.id,
            senderId: profiles.userId,
            name: profiles.name,
          },
          createdAt: chat_entries.createdAt,
        })
        .from(chat_entries)
        .leftJoin(gifts, eq(chat_entries.giftId, gifts.id))
        .leftJoin(profiles, eq(chat_entries.senderId, profiles.userId))
        .where(eq(chat_entries.id, newEntry.id));

      if (entryWithSender) {
        const usersChannel = ablyClient.channels.get(`user-events:${request.userId}`);
        const adminChannel = ablyClient.channels.get(`admin-events`);
        const eventData = { ...entryWithSender, localEntryId };
        await usersChannel.publish('entry-created', eventData);
        await adminChannel.publish('entry-created', eventData);
      }

      return entryWithSender;
    });

    return reply.code(200).send({
      success: true,
      data: {
        ...data,
        localEntryId,
      },
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: (error as Error)?.message,
    });
  }
};
