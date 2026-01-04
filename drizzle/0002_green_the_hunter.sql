CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"start_time" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extraordinary_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"apartment_id" integer NOT NULL,
	"installment" integer NOT NULL,
	"expected_amount" integer NOT NULL,
	"paid_amount" integer DEFAULT 0,
	"status" text DEFAULT 'pending',
	"paid_at" timestamp,
	"payment_method" text,
	"notes" text,
	"updated_at" timestamp DEFAULT now(),
	"updated_by" text,
	CONSTRAINT "extraordinary_payments_project_id_apartment_id_installment_unique" UNIQUE("project_id","apartment_id","installment")
);
--> statement-breakpoint
CREATE TABLE "extraordinary_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"total_budget" integer NOT NULL,
	"num_installments" integer NOT NULL,
	"start_month" integer NOT NULL,
	"start_year" integer NOT NULL,
	"document_url" text,
	"document_name" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "manager_buildings" (
	"id" serial PRIMARY KEY NOT NULL,
	"manager_id" text NOT NULL,
	"building_id" text NOT NULL,
	"is_owner" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "building" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "building" ADD COLUMN "stripe_price_id" text;--> statement-breakpoint
ALTER TABLE "building" ADD COLUMN "subscription_status" text DEFAULT 'incomplete';--> statement-breakpoint
ALTER TABLE "building" ADD COLUMN "setup_complete" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "iban" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "active_building_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "preferred_language" text DEFAULT 'pt';--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraordinary_payments" ADD CONSTRAINT "extraordinary_payments_project_id_extraordinary_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."extraordinary_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraordinary_payments" ADD CONSTRAINT "extraordinary_payments_apartment_id_apartments_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraordinary_payments" ADD CONSTRAINT "extraordinary_payments_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraordinary_projects" ADD CONSTRAINT "extraordinary_projects_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraordinary_projects" ADD CONSTRAINT "extraordinary_projects_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_buildings" ADD CONSTRAINT "manager_buildings_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_buildings" ADD CONSTRAINT "manager_buildings_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_calendar_building" ON "calendar_events" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_extra_payments_project" ON "extraordinary_payments" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_apartments_building" ON "apartments" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_payments_apartment_year" ON "payments" USING btree ("apartment_id","year");--> statement-breakpoint
ALTER TABLE "apartments" DROP COLUMN "floor";