import { Type } from '@sinclair/typebox'
export const GetConfigurationSchema = {
  tags: ['App / Configuration'],
  response: {
    200: Type.Object({
      ablyKey: Type.String()
    })
  }
};