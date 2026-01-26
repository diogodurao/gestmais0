CREATE TYPE "public"."bank_connection_status" AS ENUM('pending', 'active', 'expired', 'revoked', 'error');--> statement-breakpoint
CREATE TYPE "public"."bank_transaction_type" AS ENUM('credit', 'debit');--> statement-breakpoint
CREATE TYPE "public"."document_category" AS ENUM('atas', 'regulamentos', 'contas', 'seguros', 'contratos', 'projetos', 'outros');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('occurrence_created', 'occurrence_comment', 'occurrence_status', 'poll_created', 'poll_closed', 'discussion_created', 'discussion_comment', 'evaluation_open', 'calendar_event', 'payment_due', 'payment_overdue', 'poll');--> statement-breakpoint
CREATE TYPE "public"."occurrence_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."occurrence_status" AS ENUM('open', 'in_progress', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'late', 'partial');--> statement-breakpoint
CREATE TYPE "public"."poll_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."poll_type" AS ENUM('yes_no', 'single_choice', 'multiple_choice');--> statement-breakpoint
CREATE TYPE "public"."poll_weight_mode" AS ENUM('equal', 'permilagem');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'active', 'completed', 'cancelled', 'archived');--> statement-breakpoint
CREATE TYPE "public"."quota_mode" AS ENUM('global', 'permillage');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('incomplete', 'active', 'canceled', 'past_due');--> statement-breakpoint
CREATE TYPE "public"."transaction_match_status" AS ENUM('unmatched', 'matched', 'ignored');--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"connection_id" integer NOT NULL,
	"building_id" text NOT NULL,
	"tink_account_id" text,
	"name" text,
	"iban" text,
	"balance" integer,
	"available_balance" integer,
	"currency" text DEFAULT 'EUR',
	"account_type" text,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bank_accounts_tink_account_id_unique" UNIQUE("tink_account_id")
);
--> statement-breakpoint
CREATE TABLE "bank_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"provider_name" text,
	"status" "bank_connection_status" DEFAULT 'pending',
	"last_sync_at" timestamp,
	"last_error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" text,
	CONSTRAINT "bank_connections_building_id_unique" UNIQUE("building_id")
);
--> statement-breakpoint
CREATE TABLE "bank_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"building_id" text NOT NULL,
	"tink_transaction_id" text,
	"amount" integer NOT NULL,
	"type" "bank_transaction_type" NOT NULL,
	"description" text,
	"original_description" text,
	"transaction_date" date NOT NULL,
	"booking_date" date,
	"counterparty_name" text,
	"counterparty_iban" text,
	"matched_apartment_id" integer,
	"matched_payment_id" integer,
	"match_status" "transaction_match_status" DEFAULT 'unmatched',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "bank_transactions_tink_transaction_id_unique" UNIQUE("tink_transaction_id")
);
--> statement-breakpoint
CREATE TABLE "resident_ibans" (
	"id" serial PRIMARY KEY NOT NULL,
	"apartment_id" integer NOT NULL,
	"iban" text NOT NULL,
	"label" text,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_apartment_iban" UNIQUE("apartment_id","iban")
);
--> statement-breakpoint
ALTER TABLE "building" ALTER COLUMN "quota_mode" SET DEFAULT 'global'::"public"."quota_mode";--> statement-breakpoint
ALTER TABLE "building" ALTER COLUMN "quota_mode" SET DATA TYPE "public"."quota_mode" USING "quota_mode"::"public"."quota_mode";--> statement-breakpoint
ALTER TABLE "building" ALTER COLUMN "subscription_status" SET DEFAULT 'incomplete'::"public"."subscription_status";--> statement-breakpoint
ALTER TABLE "building" ALTER COLUMN "subscription_status" SET DATA TYPE "public"."subscription_status" USING "subscription_status"::"public"."subscription_status";--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "category" SET DATA TYPE "public"."document_category" USING "category"::"public"."document_category";--> statement-breakpoint
ALTER TABLE "extraordinary_payments" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "extraordinary_payments" ALTER COLUMN "status" SET DATA TYPE "public"."payment_status" USING "status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "extraordinary_projects" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."project_status";--> statement-breakpoint
ALTER TABLE "extraordinary_projects" ALTER COLUMN "status" SET DATA TYPE "public"."project_status" USING "status"::"public"."project_status";--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type" USING "type"::"public"."notification_type";--> statement-breakpoint
ALTER TABLE "occurrences" ALTER COLUMN "status" SET DEFAULT 'open'::"public"."occurrence_status";--> statement-breakpoint
ALTER TABLE "occurrences" ALTER COLUMN "status" SET DATA TYPE "public"."occurrence_status" USING "status"::"public"."occurrence_status";--> statement-breakpoint
ALTER TABLE "occurrences" ALTER COLUMN "priority" SET DEFAULT 'medium'::"public"."occurrence_priority";--> statement-breakpoint
ALTER TABLE "occurrences" ALTER COLUMN "priority" SET DATA TYPE "public"."occurrence_priority" USING "priority"::"public"."occurrence_priority";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE "public"."payment_status" USING "status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "type" SET DATA TYPE "public"."poll_type" USING "type"::"public"."poll_type";--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "weight_mode" SET DEFAULT 'equal'::"public"."poll_weight_mode";--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "weight_mode" SET DATA TYPE "public"."poll_weight_mode" USING "weight_mode"::"public"."poll_weight_mode";--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "status" SET DEFAULT 'open'::"public"."poll_status";--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "status" SET DATA TYPE "public"."poll_status" USING "status"::"public"."poll_status";--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_connection_id_bank_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."bank_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_connections" ADD CONSTRAINT "bank_connections_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_connections" ADD CONSTRAINT "bank_connections_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_account_id_bank_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_matched_apartment_id_apartments_id_fk" FOREIGN KEY ("matched_apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_matched_payment_id_payments_id_fk" FOREIGN KEY ("matched_payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resident_ibans" ADD CONSTRAINT "resident_ibans_apartment_id_apartments_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bank_account_connection" ON "bank_accounts" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "idx_bank_account_building" ON "bank_accounts" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_bank_account_iban" ON "bank_accounts" USING btree ("iban");--> statement-breakpoint
CREATE INDEX "idx_bank_connection_building" ON "bank_connections" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_bank_connection_status" ON "bank_connections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_bank_tx_account" ON "bank_transactions" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_bank_tx_building" ON "bank_transactions" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_bank_tx_counterparty_iban" ON "bank_transactions" USING btree ("counterparty_iban");--> statement-breakpoint
CREATE INDEX "idx_bank_tx_match_status" ON "bank_transactions" USING btree ("match_status");--> statement-breakpoint
CREATE INDEX "idx_bank_tx_transaction_date" ON "bank_transactions" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "idx_resident_ibans_apartment" ON "resident_ibans" USING btree ("apartment_id");--> statement-breakpoint
CREATE INDEX "idx_resident_ibans_iban" ON "resident_ibans" USING btree ("iban");