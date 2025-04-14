import { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../../services/supabase.js';
import { db } from "../../db/index.js";

export const me = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const token = request.cookies.access_token;
        
    const { data: { user }} = await supabase.auth.getUser(token);
    if (!user) {
        return reply.code(401).send({ error: 'User not found' });
    }


    const data = await db.query.profiles.findFirst({
        where: (profiles, { eq }) => eq(profiles.userId, user.id)
    });


    if (!data) {
        return reply.code(404).send({ message: 'User not found' });
    }

    reply.code(200).send({ data });


  } catch (error) {
      reply.code(401).send({
        success: false, error: 'User creation failed'
      })
  }
}