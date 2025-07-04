import { FastifyRequest, FastifyReply } from "fastify";
import axios from 'axios';
import { BuyTokensSchemaType } from "./schemas.js";
import env from "../../../config/env.js";
import {db} from "../../../db/index.js";
import {payments} from "../../../db/schema/payment.js";
import {and, eq} from "drizzle-orm";

export const buyTokens = async (
  request: FastifyRequest<BuyTokensSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { amount } = request.body;
    const tgUrl = `https://api.telegram.org/bot${env.telegram.botToken!}/createInvoiceLink`;

    const [data] = await db.insert(payments).values({
      profileId: request.profileId,
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
  console.log("update ======>", update);

  console.log("HOOK update=>", update);
  // @ts-ignore
  if (update.pre_checkout_query) {
    try {
      // @ts-ignore
      const payload = JSON.parse(update.pre_checkout_query.invoice_payload);
      console.log("payload", payload);
      const tgUrl = `https://api.telegram.org/bot${env.telegram.botToken!}/answerPreCheckoutQuery`;

      console.log("BEFORE updatedPayment");
      const [updatedPayment] = await db.update(payments).set({
        status: 'pre-checkout'
      }).where(eq(payments.id, payload.paymentId))

      console.log("AFTER updatedPayment", updatedPayment);

      const checkoutData = await axios.post(tgUrl, {
        // @ts-ignore
        pre_checkout_query_id: update.pre_checkout_query.id,
        ok: !!updatedPayment,
      })

      console.log("HOOK checkout ask=>", checkoutData);

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
    console.log("HOOK success payment=>", update.message?.successful_payment);
    // @ts-ignore
    const { successful_payment, from } = update.message;
    const { total_amount, invoice_payload } = successful_payment;

    try {
      const payload = JSON.parse(invoice_payload);
      const amount = parseInt(payload.amount);
      const paymentId = parseInt(payload.paymentId);

      if (total_amount !== amount) {
        return reply.send({ ok: false });
      }

      const [updatedPayment] = await db.update(payments).set({
        status: 'completed'
      }).where(and(eq(payments.id, paymentId)))

      return reply.send({ ok: true });

    } catch (error) {
      return reply.code(500).send({ ok: false });
    }
  }

  return reply.send({ ok: true, handled: false });
};