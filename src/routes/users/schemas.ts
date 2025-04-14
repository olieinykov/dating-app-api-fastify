import { Type, Static } from '@sinclair/typebox'
import { PaginationSchema } from '../../shared/schemas.js'

export const CreateUserSchema = {
  tags: ['Users'],
  body: Type.Object({
    email: Type.String(),
    firstName: Type.String(),
    lastName: Type.String(),
    role: Type.String(),
    avatar: Type.Optional(Type.String()),
    about: Type.Optional(Type.String()),
    country: Type.Optional(Type.String()),
    city: Type.Optional(Type.String()),
    languageCode: Type.Optional(Type.String()),
  })
};
export type CreateUserType = {
  Body: Static<typeof CreateUserSchema.body>;
};

export const UpdateUsersSchema = {
  tags: ['Users'],
  parameters: Type.Object({
    userId: Type.Integer(),
  }),
  body: CreateUserSchema.body,
};
export type UpdateUsersType = {
  Body: Static<typeof UpdateUsersSchema.body>;
  Params: Static<typeof UpdateUsersSchema.parameters>;
};

export const GetAllUsersSchema = {
  tags: ['Users'],
  querystring: Type.Intersect([PaginationSchema, Type.Object({
    role: Type.String()
  })]),
}
export type GetAllUsersType = {
  Querystring: Static<typeof GetAllUsersSchema.querystring>
}

export const GetOneUserSchema = {
  tags: ['Users'],
  parameters: Type.Object({
    userId: Type.Integer(),
  })
};
export type GetOneUserType = {
  Params: Static<typeof GetOneUserSchema.parameters>;
}

export const DeleteUserSchema = {
  tags: ['Users'],
  parameters: Type.Object({
    userId: Type.Integer(),
  })
};
export type DeleteUserType = {
  Params: Static<typeof DeleteUserSchema.parameters>
};