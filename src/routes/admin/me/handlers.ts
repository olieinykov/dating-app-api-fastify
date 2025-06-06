import { supabase } from '../../../services/supabase.js'
import { FastifyRequest, FastifyReply } from 'fastify'

export const getMe = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
  try {
    const token = request.cookies.access_token;

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return reply.code(401).send({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) throw error;
    if (!data) {
      return reply.code(404).send({
        success: false,
        message: 'User not found'
      });
    }

    reply.send({
      data
    });
  } catch (error) {
    console.log("error", error);
    reply.code(401).send({
      success: false,
      error: 'Access denied'
    })
  }
}