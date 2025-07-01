import { FastifyRequest, FastifyReply } from "fastify";
import axios from 'axios';
import { db } from "../../../db/index.js";
import { BuyTokensSchemaType } from "./schemas.js";
import env from "../../../config/env.js";

export const buyTokens = async (
  request: FastifyRequest<BuyTokensSchemaType>,
  reply: FastifyReply
) => {
  try {
    const { amount } = request.body;
    const tgUrl = `https://api.telegram.org/bot${env.telegram.botToken!}/createInvoiceLink`;
    // const response = await axios.get(tgUrl);
    const invoiceData = await axios.post(tgUrl, {
      title: "Buy tokens",
      description: "Buy tokens for Amorium",
      payload: {
        amount: amount.toString(),
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
    
    // console.log("Telegram API response:", response.data);

    // console.log("buyTokens request", amount);
  } catch (error) {
      console.log("error", error)
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

  console.log("HOOK update=>", update);
  // @ts-ignore
  if (update.pre_checkout_query) {
    try {
      const tgUrl = `https://api.telegram.org/bot${env.telegram.botToken!}/answerPreCheckoutQuery`;
      // const response = await axios.get(tgUrl);

      console.log("HOOK checkout ask=>");
      const checkoutData = await axios.post(tgUrl, {
        // @ts-ignore
        pre_checkout_query_id: update.pre_checkout_query.id,
        ok: true,
      })

      console.log("HOOK checkout ask=>", checkoutData);

      return reply.send({
        success: true,
      });
    } catch (error) {
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
      const profileId = payload.profileId;

      if (total_amount !== amount) {
        // await sendTelegramMessage(
        //   from.id,
        // );
        return reply.send({ ok: false });
      }

      // await db.profiles.update({
      //   where: { id: profileId },
      //   data: { tokens: { increment: amount } }
      // });

      return reply.send({ ok: true });

    } catch (error) {
      return reply.code(500).send({ ok: false });
    }
  }

  return reply.send({ ok: true, handled: false });
};