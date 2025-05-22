import { FastifyInstance } from 'fastify'
import { getAllUsers, getOneUser, deleteUser, createUser, updateUser } from './handlers.js'
import { CreateUserSchema, GetOneUserSchema, DeleteUserSchema, GetAllUsersSchema, UpdateUsersSchema } from "./schemas.js";
import {adminAuthenticated} from "../../../middleware/adminAuthenticated";

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/', {
    schema: CreateUserSchema,
    // preHandler: [adminAuthenticated],
    handler: createUser,
  })
  fastify.put('/:userId', {
    schema: UpdateUsersSchema,
    preHandler: [adminAuthenticated],
    handler: updateUser
  })
  fastify.get('/', {
    schema: GetAllUsersSchema,
    preHandler: [adminAuthenticated],
    handler: getAllUsers
  })
  fastify.get('/:userId', {
    schema: GetOneUserSchema,
    preHandler: [adminAuthenticated],
    handler: getOneUser
  })
  fastify.delete('/:userId', {
    schema: DeleteUserSchema,
    preHandler: [adminAuthenticated],
    handler: deleteUser
  })
}

export default routes;