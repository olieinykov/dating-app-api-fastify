import { FastifyReply, FastifyRequest } from "fastify";
import { supabase } from "../services/supabase";

export const userAuthenticated = async (request: FastifyRequest, reply: FastifyReply) => {
    const accessToken = request.cookies.access_token;

    if (!accessToken) {
        return reply.status(401).send({ success: false, message: 'Access denied' });
    }

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
        return reply.status(401).send({ success: false, message: 'Access denied' });
    }

    request.user = data.user;
};