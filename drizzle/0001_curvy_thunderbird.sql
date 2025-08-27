ALTER TYPE "public"."operation" ADD VALUE 'paid-chat-entry';--> statement-breakpoint
ALTER TABLE "chat_entries" ADD COLUMN "is_premium_message" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_entries" ADD COLUMN "entry_price" integer;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "blurred_url" text;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "blurred_file_name" text;