import { FastifyInstance } from 'fastify'
import { getAllUsers, getOneUser, deleteUser, createUser, updateUser } from './handlers.js'
import { CreateUserSchema, GetOneUserSchema, DeleteUserSchema, GetAllUsersSchema, UpdateUsersSchema } from "./schemas";

const routes = async (fastify: FastifyInstance) => {
  fastify.post('/', {
    schema: CreateUserSchema,
    handler: createUser,
  })
  fastify.put('/:userId', {
    schema: UpdateUsersSchema,
    handler: updateUser
  })
  fastify.get('/', {
    schema: GetAllUsersSchema,
    handler: getAllUsers
  })
  fastify.get('/:userId', {
    schema: GetOneUserSchema,
    handler: getOneUser
  })
  fastify.delete('/:userId', {
    schema: DeleteUserSchema,
    handler: deleteUser
  })
}

export default routes;