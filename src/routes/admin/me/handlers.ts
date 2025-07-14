import { supabase } from '../../../services/supabase.js';
import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../../db/index.js';
import { profiles } from '../../../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = request.cookies.adminAccessToken;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return reply.code(401).send({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    const [data] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);

    if (!data) {
      return reply.code(404).send({
        success: false,
        message: 'User not found',
      });
    }

    reply.send({
      data,
    });
  } catch (error) {
    console.log('error', error);
    reply.code(401).send({
      success: false,
      error: 'Access denied',
    });
  }
};
