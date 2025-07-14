import { FastifyReply, FastifyRequest } from 'fastify';
import { supabase } from '../services/supabase.js';
import { db } from '../db/index.js';
import { profiles } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const adminAuthenticated = async (request: FastifyRequest, reply: FastifyReply) => {
  const accessToken = request.cookies.adminAccessToken;

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

  if (!profile) {
    return reply.status(403).send({ success: false, message: 'User not found' });
  }

  if (profile?.deactivatedAt) {
    return reply.status(403).send({ success: false, message: 'User deactivated' });
  }

  request.profileId = profile.id;
  request.role = profile.role!;
  request.userId = data.user.id;
};
