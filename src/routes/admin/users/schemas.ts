import { Type, Static, Optional } from '@sinclair/typebox';
import { PaginationSchema } from '../../../shared/schemas.js';

export const CreateUserSchema = {
  tags: ['Admin / Users'],
  body: Type.Object({
    email: Type.String(),
    password: Type.String(),
    name: Type.String(),
    role: Type.String(),
    avatar: Type.Optional(Type.String()),
    // about: Type.Optional(Type.String()),
    // country: Type.Optional(Type.String()),
    // city: Type.Optional(Type.String()),
    // languageCode: Type.Optional(Type.String()),
  }),
};
export type CreateUserType = {
  Body: Static<typeof CreateUserSchema.body>;
};

export const UpdateUsersSchema = {
  tags: ['Admin / Users'],
  parameters: Type.Object({
    userId: Type.Integer(),
  }),
  body: Type.Object({
    name: Type.String(),
    // lastName: Type.String(),
    // role: Type.String(),
    avatar: Type.Optional(Type.String()),
    // about: Type.Optional(Type.String()),
    // country: Type.Optional(Type.String()),
    // city: Type.Optional(Type.String()),
    // languageCode: Type.Optional(Type.String()),
  }),
};
export type UpdateUsersType = {
  Body: Static<typeof UpdateUsersSchema.body>;
  Params: Static<typeof UpdateUsersSchema.parameters>;
};

export const GetAllUsersSchema = {
  tags: ['Admin / Users'],
  querystring: Type.Intersect([
    PaginationSchema,
    Type.Object({
      role: Type.String(),
      deactivated: Optional(Type.Boolean()),
    }),
  ]),
};
export type GetAllUsersType = {
  Querystring: Static<typeof GetAllUsersSchema.querystring>;
};

export const GetOneUserSchema = {
  tags: ['Admin / Users'],
  parameters: Type.Object({
    userId: Type.Integer(),
  }),
};
export type GetOneUserType = {
  Params: Static<typeof GetOneUserSchema.parameters>;
};

export const DeleteUserSchema = {
  tags: ['Admin / Users'],
  parameters: Type.Object({
    userId: Type.Integer(),
  }),
};
export type DeleteUserType = {
  Params: Static<typeof DeleteUserSchema.parameters>;
};

export const ActivateUserSchema = {
  tags: ['Admin / Users'],
  parameters: Type.Object({
    userId: Type.Integer(),
  }),
};
export type ActivateUserType = {
  Params: Static<typeof ActivateUserSchema.parameters>;
};

export const GetUserActionsSchema = {
  tags: ['Admin / Users'],
  querystring: Type.Intersect([
    PaginationSchema,
    Type.Object({
      profileId: Optional(Type.Integer()),
      actionType: Optional(
        Type.Enum({
          create: 'create',
          edit: 'edit',
          delete: 'delete',
        })
      ),
      sortOrder: Optional(
        Type.Enum({
          asc: 'asc',
          desc: 'desc',
        })
      ),
    }),
  ]),
};

export type GetUserActionsType = {
  Querystring: Static<typeof GetUserActionsSchema.querystring>;
};

export const GetUserDetailsSchema = {
  tags: ['Admin / Users'],
  parameters: Type.Object({
    userId: Type.Integer(),
  }),
};
export type GetUserDetailsType = {
  Params: Static<typeof GetUserDetailsSchema.parameters>;
};

export const DeleteUserCompleteSchema = {
  tags: ['Admin / Users'],
  parameters: Type.Object({
    userId: Type.Integer(),
  }),
};
export type DeleteUserCompleteType = {
  Params: Static<typeof DeleteUserCompleteSchema.parameters>;
};
