import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const files = pgTable('files', {
    id: uuid('id').primaryKey().defaultRandom(),
    fileName: text('file_name').notNull(),
    url: text('url').notNull(),
    bucket: text('bucket').notNull(),
    originalName: text('original_name').notNull(),
    extension: text('extension').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer('size').notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});