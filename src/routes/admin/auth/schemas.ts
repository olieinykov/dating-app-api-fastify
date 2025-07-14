import { Type, Static } from '@sinclair/typebox';

export const LoginSchema = {
  tags: ['Admin / Auth'],
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 6 }),
  }),
};
export type LoginBodyType = {
  Body: Static<typeof LoginSchema.body>;
};

export const LogoutSchema = {
  tags: ['Admin / Auth'],
  body: null,
};
