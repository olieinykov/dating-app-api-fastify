import { FastifyReply, FastifyRequest } from 'fastify';
import { supabase } from '../services/supabase.js';
import { db } from '../db/index.js';
import { profiles } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const userAuthenticated = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send({ success: false, message: 'Authorization header missing' });
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return reply.status(401).send({ success: false, message: 'Invalid authorization format' });
  }

  const accessToken = tokenParts[1];

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return reply.status(401).send({ success: false, message: 'Invalid or expired token' });
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, data.user.id),
  });

  if (!profile) {
    return reply.status(403).send({ success: false, message: 'Profile not found' });
  }

  if (profile?.deactivatedAt) {
    return reply.status(403).send({ success: false, message: 'User deactivated' });
  }

  request.profileId = profile.id;
  request.userId = data.user.id;
};
