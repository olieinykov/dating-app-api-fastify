import { Static, Type } from "@sinclair/typebox";

export const SetupTelegramHooksSchema = {
  tags: ['Admin / Telegram'],
  body: Type.Object({
    webhookUrl: Type.String(),
  })
};

export type SetupTelegramHooksSchemaType = {
  Body: Static<typeof SetupTelegramHooksSchema.body>
}