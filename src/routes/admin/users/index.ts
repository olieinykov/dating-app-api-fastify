import { FastifyInstance } from 'fastify';
import {
  getAllUsers,
  getOneUser,
  deleteUser,
  activateUser,
  createUser,
  updateUser,
  getUserActions,
} from './handlers.js';
import {
  CreateUserSchema,
  GetOneUserSchema,
  DeleteUserSchema,
  ActivateUserSchema,
  GetAllUsersSchema,
  UpdateUsersSchema,
  GetUserActionsSchema,
} from './schemas.js';
import { adminAuthenticated } from '../../../middleware/adminAuthenticated.js';

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/', {
    schema: CreateUserSchema,
    // preHandler: [adminAuthenticated],
    handler: createUser,
  });
  fastify.put('/:userId', {
    schema: UpdateUsersSchema,
    preHandler: [adminAuthenticated],
    handler: updateUser,
  });
  fastify.get('/', {
    schema: GetAllUsersSchema,
    preHandler: [adminAuthenticated],
    handler: getAllUsers,
  });
  fastify.get('/:userId', {
    schema: GetOneUserSchema,
    preHandler: [adminAuthenticated],
    handler: getOneUser,
  });
  fastify.delete('/:userId', {
    schema: DeleteUserSchema,
    preHandler: [adminAuthenticated],
    handler: deleteUser,
  });
  fastify.patch('/:userId', {
    schema: ActivateUserSchema,
    preHandler: [adminAuthenticated],
    handler: activateUser,
  });
  fastify.get('/users-actions', {
    schema: GetUserActionsSchema,
    preHandler: [adminAuthenticated],
    handler: getUserActions,
  });
};

export default routes;
