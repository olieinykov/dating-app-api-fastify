import { pgTable, serial, boolean } from 'drizzle-orm/pg-core'
import { uuid } from "drizzle-orm/pg-core";
import { files } from "./file.js";
import { models } from "./model.js";

export const models_photos = pgTable('models_photos', {
  id: serial('id').primaryKey(),
  modelId: serial('model_id').references(() => models.id),
  fileId: uuid('file_id')
      .references(() => files.id, { onDelete: 'cascade' })
      .notNull(),
  isAvatar: boolean('is_avatar'),
});