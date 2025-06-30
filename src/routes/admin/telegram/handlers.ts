import { FastifyRequest, FastifyReply } from 'fastify';
import env from "../../../config/env.js"
import { SetupTelegramHooksSchemaType } from "./schemas.js";
import axios from "axios";

export const setupTelegramHooks = async (
    request: FastifyRequest<SetupTelegramHooksSchemaType>,
    reply: FastifyReply
) => {
  try {
    const webhookUrl = request.body.webhookUrl;
    // https://dating-be-mvp.onrender.com/api/app/balance/telegram-payment-webhook
    const response =  await axios.post(`https://api.telegram.org/bot${env.telegram.botToken!}/setWebhook?url=${webhookUrl}`);
    console.log("setupTelegramHooks response", response);
    return reply.code(200).send({
      success: true,
    });
  } catch (error) {
    return reply.code(400).send({
      success: false,
    });
  }
}