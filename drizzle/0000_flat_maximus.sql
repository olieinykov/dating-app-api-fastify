CREATE TABLE "gifts" (
	"id" bigint PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_by" bigint NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"email" text,
	"telegram_id" integer NOT NULL,
	"telegram_name" text,
	"click_id" text,
	"first_name" text,
	"last_name" text,
	"role" text NOT NULL,
	"avatar" text,
	"about" text,
	"banned_at" timestamp,
	"country" text,
	"city" text,
	"language_code" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_email_unique" UNIQUE("email"),
	CONSTRAINT "profiles_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"description" text,
	"created_by" bigint NOT NULL,
	"avatar" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "model_gifts" (
	"id" bigint PRIMARY KEY NOT NULL,
	"model_id" bigint NOT NULL,
	"gift_id" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models" ADD CONSTRAINT "models_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_gifts" ADD CONSTRAINT "model_gifts_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_gifts" ADD CONSTRAINT "model_gifts_gift_id_gifts_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gifts"("id") ON DELETE no action ON UPDATE no action;