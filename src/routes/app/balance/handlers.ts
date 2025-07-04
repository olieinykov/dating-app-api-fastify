import { FastifyRequest, FastifyReply } from "fastify";
import axios from 'axios';
import { BuyTokensSchemaType } from "./schemas.js";
import env from "../../../config/env.js";
import {db} from "../../../db/index.js";
import {payments} from "../../../db/schema/payment.js";
import {and, eq} from "drizzle-orm";
import {profile_balances} from "../../../db/schema/profile_balances.js";

export const buyTokens = async (
  request: FastifyRequest<BuyTokensSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { amount } = request.body;
    const tgUrl = `https://api.telegram.org/bot${env.telegram.botToken!}/createInvoiceLink`;

    const [data] = await db.insert(payments).values({
      profileId: request.profileId,
      // profileId: 4, ///Remove this mock
      amount: amount,
      status: "pending",

    }).returning();

    const invoiceData = await axios.post(tgUrl, {
      title: "Buy tokens",
      description: "Buy tokens for Amorium",
      payload: {
        amount: amount.toString(),
        paymentId: data.id,
        profileId: request.profileId,
        // profileId: 4, ///Remove this mock
        operation: "BUY_TOKENS"
      },
      provider_token: env.telegram.botToken,
      currency: "XTR",
      prices: [
        {
          label: `${amount} Stars`,
          amount: amount,
        }
      ],
    })

    reply.code(200).send({
      success: true,
      data: {
        invoiceUrl: invoiceData.data.result,
      },
    });
  } catch (error) {
    reply.code(404).send({
      success: false,
      message: "Failed to buy tokens",
    });
  }
};


export const telegramPaymentWebhook = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const update = request.body;
  // @ts-ignore
  if (update.pre_checkout_query) {
    try {
      // @ts-ignore
      const payload = JSON.parse(update.pre_checkout_query.invoice_payload);
      const tgUrl = `https://api.telegram.org/bot${env.telegram.botToken!}/answerPreCheckoutQuery`;
      const [updatedPayment] = await db.update(payments).set({
        status: 'pre-checkout'
      }).where(eq(payments.id, payload.paymentId)).returning()

      const checkoutData = await axios.post(tgUrl, {
        // @ts-ignore
        pre_checkout_query_id: update.pre_checkout_query.id,
        error_message: !updatedPayment ? "Failed to handle payment" : undefined,
        ok: !!updatedPayment,
      })

      return reply.send({
        success: true,
      });
    } catch (error) {
      console.log("ERROR 1", error);
      return reply.send({
        success: false,
      });
    }
  }


  // @ts-ignore
  if (update.message?.successful_payment) {
    // @ts-ignore
    const { successful_payment, from } = update.message;
    const { total_amount, invoice_payload } = successful_payment;

    try {
      const payload = JSON.parse(invoice_payload);
      const amount = parseInt(payload.amount);
      const paymentId = parseInt(payload.paymentId);
      const profileId = parseInt(payload.profileId);

      const result = await db.transaction(async (tx) => {
        try {
          const [updatedPayment] = await tx.update(payments).set({
            status: 'completed'
          }).where(and(eq(payments.id, paymentId))).returning()

          const [existingBalance] = await tx
              .select({ balance: profile_balances.balance })
              .from(profile_balances)
              .where(eq(profile_balances.profileId, profileId))
              .limit(1);

          const currentUserBalance = existingBalance?.balance ?? 0;

          const updatedBalance = await tx.update(profile_balances).set({
            balance: currentUserBalance + (amount ?? 0)
          })
          .where(and(eq(profile_balances.profileId, profileId))).returning()

          return !(!updatedPayment || !updatedBalance);

        } catch (error) {
          console.log("Payment error", error)
          return false;
        }
      });

      return reply.send({ ok: result });

    } catch (error) {
      return reply.code(500).send({ ok: false });
    }
  }

  return reply.send({ ok: true, handled: false });
};