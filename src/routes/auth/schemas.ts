import { Type, Static } from '@sinclair/typebox'

export const LoginSchema = {
  tags: ['Auth'],
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 6 })
  })
};
export type LoginBodyType = {
  Body: Static<typeof LoginSchema.body>
}

export const LogoutSchema = {
  tags: ['Auth'],
  body: null
};
