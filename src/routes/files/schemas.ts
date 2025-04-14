import { Type, Static } from '@sinclair/typebox'
export const UploadFileSchema = {
  tags: ['Files'],
  body: Type.Object({
    file: Type.Any(),
  }),
};

export type UploadFileType = {
  Body: Static<typeof UploadFileSchema.body>;
};