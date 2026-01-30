CREATE TYPE "public"."professional_type" AS ENUM('accountant', 'lawyer', 'consultant');--> statement-breakpoint
CREATE TABLE "building_professionals" (
	"id" serial PRIMARY KEY NOT NULL,
	"professional_id" text NOT NULL,
	"building_id" text NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"professional_type" "professional_type" NOT NULL,
	"can_view_payments" boolean DEFAULT false NOT NULL,
	"can_view_documents" boolean DEFAULT false NOT NULL,
	"can_view_reports" boolean DEFAULT false NOT NULL,
	"can_view_occurrences" boolean DEFAULT false NOT NULL,
	"can_view_polls" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_professional_building" UNIQUE("professional_id","building_id")
);
--> statement-breakpoint
CREATE TABLE "professional_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" text NOT NULL,
	"invited_email" text NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"professional_type" "professional_type" NOT NULL,
	"status" "collaborator_invitation_status" DEFAULT 'pending' NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "professional_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "professional_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"professional_id" text NOT NULL,
	"professional_type" "professional_type" NOT NULL,
	"company_name" text,
	"phone" text NOT NULL,
	"nif" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_professional_id_type" UNIQUE("professional_id","professional_type")
);
--> statement-breakpoint
ALTER TABLE "building_professionals" ADD CONSTRAINT "building_professionals_professional_id_user_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_professionals" ADD CONSTRAINT "building_professionals_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_professionals" ADD CONSTRAINT "building_professionals_invited_by_user_id_user_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_invitations" ADD CONSTRAINT "professional_invitations_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_invitations" ADD CONSTRAINT "professional_invitations_invited_by_user_id_user_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_building_professionals_professional" ON "building_professionals" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "idx_building_professionals_building" ON "building_professionals" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_building_professionals_type" ON "building_professionals" USING btree ("professional_type");--> statement-breakpoint
CREATE INDEX "idx_professional_invitations_building" ON "professional_invitations" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_professional_invitations_token" ON "professional_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_professional_invitations_status" ON "professional_invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_professional_invitations_email" ON "professional_invitations" USING btree ("invited_email");--> statement-breakpoint
CREATE INDEX "idx_professional_profiles_user" ON "professional_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_professional_profiles_type" ON "professional_profiles" USING btree ("professional_type");--> statement-breakpoint
CREATE INDEX "idx_collaborator_invitations_email" ON "collaborator_invitations" USING btree ("invited_email");