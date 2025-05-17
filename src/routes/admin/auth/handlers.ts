import { supabase } from '../../../services/supabase.js'
import { FastifyRequest, FastifyReply } from 'fastify'
import { LoginBodyType } from './schemas.js'
import {CookieSerializeOptions} from "@fastify/cookie";

const cookiesConfig: CookieSerializeOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
}

export const login = async (
    request: FastifyRequest<LoginBodyType>,
    reply: FastifyReply
) => {
  try {
    const { email, password } = request.body;

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !authData) {
      reply.code(400).send({
        status: 'error',
        message: error?.message,
      });
    }

    reply.setCookie('adminAccessToken', authData?.session?.access_token!, {
      ...cookiesConfig,
      maxAge: 10 * 60 * 1000,
    });

    reply.setCookie('adminRefreshToken', authData?.session?.refresh_token!, {
      ...cookiesConfig,
      maxAge: 24 * 60 * 60 * 1000,
    });

    reply.code(200);
  } catch (error) {
    reply.code(401).send({
      success: false, error: 'User creation failed'
    })
  }
}

export const logout = async (request: FastifyRequest<LoginBodyType>, reply: FastifyReply) => {
  reply.clearCookie('adminAccessToken');
  reply.clearCookie('adminRefreshToken');

  return reply.code(200);
};
