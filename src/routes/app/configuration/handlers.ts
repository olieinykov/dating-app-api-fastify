import { FastifyRequest, FastifyReply } from 'fastify'
import env from "../../../config/env.js";

export const getConfiguration = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        return reply.code(200).send({
            ablyKey: env.ably.token,
        })
    } catch (error) {
        reply.code(400).send({
            success: false,
            error: (error as Error).message
        });
    }
};
