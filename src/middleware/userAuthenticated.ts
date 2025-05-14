import { FastifyReply, FastifyRequest } from "fastify";
import { supabase } from "../services/supabase";
import { db} from "../db";
import { profiles } from "../db/schema";
import { eq } from "drizzle-orm";

export const userAuthenticated = async (request: FastifyRequest, reply: FastifyReply) => {
    const accessToken = request.cookies.access_token;

    if (!accessToken) {
        return reply.status(401).send({ success: false, message: 'Access denied' });
    }

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
        return reply.status(401).send({ success: false, message: 'Access denied' });
    }

    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, data.user.id),
    });

    console.log("profile", profile)

    if (!profile) {
        return reply.status(403).send({ success: false, message: 'Profile not found' });
    }


    request.profileId = profile.id;
    request.userId = data.user.id;
};