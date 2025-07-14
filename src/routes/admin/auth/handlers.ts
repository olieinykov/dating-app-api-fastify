import { supabase } from '../../../services/supabase.js';
import { FastifyRequest, FastifyReply } from 'fastify';
import { LoginBodyType } from './schemas.js';
import { CookieSerializeOptions } from '@fastify/cookie';
import env from '../../../config/env.js';

const cookiesConfig: CookieSerializeOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  // path: '/',
  path: '/api/admin',
};

export const login = async (request: FastifyRequest<LoginBodyType>, reply: FastifyReply) => {
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

    reply
      .clearCookie('adminAccessToken', cookiesConfig)
      .clearCookie('adminRefreshToken', cookiesConfig);

    reply.setCookie('adminAccessToken', authData?.session?.access_token!, {
      ...cookiesConfig,
      maxAge: env.appConfig.adminTokenExpirationTime,
    });

    reply.setCookie('adminRefreshToken', authData?.session?.refresh_token!, {
      ...cookiesConfig,
      maxAge: env.appConfig.adminRefreshTokenExpirationTime,
    });

    reply.code(200);
  } catch (error) {
    reply.code(401).send({
      success: false,
      error: 'User creation failed',
    });
  }
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await supabase.auth.signOut();
    return reply
      .clearCookie('adminAccessToken', cookiesConfig)
      .clearCookie('adminRefreshToken', cookiesConfig)
      .code(200)
      .send({ success: true });
  } catch (error) {
    return reply.code(500).send({
      success: false,
      error: 'Logout failed',
    });
  }
};
