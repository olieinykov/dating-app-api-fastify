CREATE TYPE "public"."message_type" AS ENUM('text', 'gift');--> statement-breakpoint
CREATE TYPE "public"."action_type" AS ENUM('create', 'edit', 'delete');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'chatter', 'user');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."params_age" AS ENUM('18-24', '25-34', '35-44', '45+');--> statement-breakpoint
CREATE TYPE "public"."params_body_type" AS ENUM('athletic', 'curvy', 'slim');--> statement-breakpoint
CREATE TYPE "public"."params_bust_size" AS ENUM('AA-A', 'B-C', 'D-E', 'F+');--> statement-breakpoint
CREATE TYPE "public"."params_hair_color" AS ENUM('blonde', 'brunette', 'brown-haired', 'redhead');--> statement-breakpoint
CREATE TYPE "public"."operation" AS ENUM('gift', 'balance', 'tariff');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'completed', 'failed', 'pre-checkout');--> statement-breakpoint
CREATE TABLE "chat" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_entries_unread" (
	"user_id" uuid NOT NULL,
	"chat_id" integer,
	"chat_entry_id" integer NOT NULL,
	"read_at" timestamp DEFAULT now(),
	CONSTRAINT "chat_entries_unread_user_id_chat_entry_id_pk" PRIMARY KEY("user_id","chat_entry_id")
);
--> statement-breakpoint
CREATE TABLE "chat_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"body" text,
	"chat_id" integer,
	"gift_id" integer,
	"type" "message_type" NOT NULL,
	"sender_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_entry_files" (
	"chat_entry_id" integer NOT NULL,
	"file_id" uuid NOT NULL,
	CONSTRAINT "chat_entry_files_chat_entry_id_file_id_pk" PRIMARY KEY("chat_entry_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "chat_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"last_read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "disliked_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"model_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"url" text NOT NULL,
	"bucket" text NOT NULL,
	"original_name" text NOT NULL,
	"extension" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gifts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"price" integer,
	"image" text,
	"restricted_countries" json,
	"deactivated_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gifts_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" uuid NOT NULL,
	"gift_id" integer,
	"action_type" "action_type" NOT NULL,
	"action_time" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"name" varchar(30),
	"email" text,
	"telegram_id" bigint,
	"role" text,
	"avatar" text,
	"activated_at" timestamp,
	"deactivated_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_active_time" timestamp,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"description" text,
	"avatar" text,
	"age" integer NOT NULL,
	"gender" "gender" NOT NULL,
	"bust_size" "params_bust_size" NOT NULL,
	"hair_color" "params_hair_color" NOT NULL,
	"body_type" "params_body_type" NOT NULL,
	"deactivated_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_active_time" timestamp,
	CONSTRAINT "models_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "model_gifts" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" bigint NOT NULL,
	"gift_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" serial NOT NULL,
	"about" text,
	"date_of_birth" date,
	"gender" "gender",
	"hobbies" json,
	"city" text,
	"country" text,
	"params_age" "params_age",
	"params_bust_size" "params_bust_size",
	"params_hair_color" "params_hair_color",
	"params_body_type" "params_body_type",
	"tariff_id" integer,
	"entries_sent_today" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" serial NOT NULL,
	"file_id" uuid NOT NULL,
	"is_avatar" boolean
);
--> statement-breakpoint
CREATE TABLE "profiles_telegram" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" bigint,
	"telegram_name" text,
	"click_id" text,
	"first_name" text,
	"last_name" text,
	"language_code" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_telegram_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE "model_profile_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"model_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "models_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" uuid NOT NULL,
	"model_id" integer,
	"action_type" "action_type" NOT NULL,
	"action_time" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" uuid NOT NULL,
	"profile_id" integer,
	"action_type" "action_type" NOT NULL,
	"action_time" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles_subscription" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" serial NOT NULL,
	"is_trial" boolean DEFAULT false,
	"initiated_at" timestamp DEFAULT now(),
	"prolonged_at" timestamp,
	"expiration_at" timestamp,
	CONSTRAINT "uniq_profile" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"operation" "operation" NOT NULL,
	"status" "status" NOT NULL,
	"profile_id" integer,
	"gift_id" integer,
	"model_id" integer,
	"tariff_id" integer,
	"tokens_amount" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profile_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" serial NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profile_gift_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" serial NOT NULL,
	"model_id" serial NOT NULL,
	"gift_id" serial NOT NULL,
	"price" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "models_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" serial NOT NULL,
	"file_id" uuid NOT NULL,
	"is_avatar" boolean
);
--> statement-breakpoint
CREATE TABLE "tariffs" (
	"id" serial PRIMARY KEY NOT NULL,
	"price" integer NOT NULL,
	"days_period" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chat_entries_unread" ADD CONSTRAINT "chat_entries_unread_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_entries_unread" ADD CONSTRAINT "chat_entries_unread_chat_entry_id_chat_entries_id_fk" FOREIGN KEY ("chat_entry_id") REFERENCES "public"."chat_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_entries" ADD CONSTRAINT "chat_entries_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_entries" ADD CONSTRAINT "chat_entries_gift_id_gifts_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_entry_files" ADD CONSTRAINT "chat_entry_files_chat_entry_id_chat_entries_id_fk" FOREIGN KEY ("chat_entry_id") REFERENCES "public"."chat_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_entry_files" ADD CONSTRAINT "chat_entry_files_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disliked_models" ADD CONSTRAINT "disliked_models_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disliked_models" ADD CONSTRAINT "disliked_models_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gifts_actions" ADD CONSTRAINT "gifts_actions_gift_id_gifts_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_telegram_id_profiles_telegram_telegram_id_fk" FOREIGN KEY ("telegram_id") REFERENCES "public"."profiles_telegram"("telegram_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_gifts" ADD CONSTRAINT "model_gifts_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_gifts" ADD CONSTRAINT "model_gifts_gift_id_gifts_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles_preferences" ADD CONSTRAINT "profiles_preferences_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles_preferences" ADD CONSTRAINT "profiles_preferences_tariff_id_tariffs_id_fk" FOREIGN KEY ("tariff_id") REFERENCES "public"."tariffs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles_photos" ADD CONSTRAINT "profiles_photos_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles_photos" ADD CONSTRAINT "profiles_photos_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_profile_assignments" ADD CONSTRAINT "model_profile_assignments_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_profile_assignments" ADD CONSTRAINT "model_profile_assignments_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models_actions" ADD CONSTRAINT "models_actions_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles_actions" ADD CONSTRAINT "profiles_actions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles_subscription" ADD CONSTRAINT "profiles_subscription_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_gift_id_gifts_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tariff_id_tariffs_id_fk" FOREIGN KEY ("tariff_id") REFERENCES "public"."tariffs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_balances" ADD CONSTRAINT "profile_balances_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_gift_transactions" ADD CONSTRAINT "profile_gift_transactions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_gift_transactions" ADD CONSTRAINT "profile_gift_transactions_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_gift_transactions" ADD CONSTRAINT "profile_gift_transactions_gift_id_gifts_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models_photos" ADD CONSTRAINT "models_photos_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models_photos" ADD CONSTRAINT "models_photos_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_chat_user" ON "chat_participants" USING btree ("chat_id","user_id");