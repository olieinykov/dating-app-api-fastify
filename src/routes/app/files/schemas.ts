import { Type, Static } from '@sinclair/typebox'
export const UploadFileSchema = {
  tags: ['App / Files'],
  body: Type.Any(),
};

export type UploadFileType = {
  Body: Static<typeof UploadFileSchema.body>;
};