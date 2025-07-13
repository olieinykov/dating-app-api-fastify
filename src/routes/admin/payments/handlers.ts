import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from "../../../db/index.js";
import {payments, paymentStatusEnum} from "../../../db/schema/payment.js";
import {eq} from "drizzle-orm";
import {profiles} from "../../../db/schema/index.js";
import {integer, serial, timestamp} from "drizzle-orm/pg-core/index";

export const getPayments = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
  try {
    const data = await db.select({
      id: payments.id,
      profile: profiles,
      amount: payments.amount,
      status: payments.status,
      createdAt: payments.createdAt,
      updatedAt: payments.updatedAt,
    })
        .from(payments)
        .leftJoin(profiles, eq(payments.profileId, profiles.id))
    return reply.code(200).send({
      success: true,
      data
    });
  } catch (error) {
    return reply.code(400).send({
      success: false,
    });
  }
}