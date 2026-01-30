CREATE TYPE "public"."collaborator_invitation_status" AS ENUM('pending', 'accepted', 'declined', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."manager_building_role" AS ENUM('owner', 'collaborator');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'subscription_payment_failed';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'collaborator_invited';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'collaborator_accepted';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'collaborator_declined';--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'unpaid';--> statement-breakpoint
CREATE TABLE "collaborator_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" text NOT NULL,
	"invited_user_id" text,
	"invited_email" text,
	"invited_by_user_id" text NOT NULL,
	"role" "manager_building_role" DEFAULT 'collaborator' NOT NULL,
	"status" "collaborator_invitation_status" DEFAULT 'pending' NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collaborator_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "building" ADD COLUMN "subscription_current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "building" ADD COLUMN "subscription_past_due_at" timestamp;--> statement-breakpoint
ALTER TABLE "manager_buildings" ADD COLUMN "role" "manager_building_role" DEFAULT 'owner' NOT NULL;--> statement-breakpoint
ALTER TABLE "collaborator_invitations" ADD CONSTRAINT "collaborator_invitations_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_invitations" ADD CONSTRAINT "collaborator_invitations_invited_user_id_user_id_fk" FOREIGN KEY ("invited_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_invitations" ADD CONSTRAINT "collaborator_invitations_invited_by_user_id_user_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_collaborator_invitations_building" ON "collaborator_invitations" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_collaborator_invitations_invited_user" ON "collaborator_invitations" USING btree ("invited_user_id");--> statement-breakpoint
CREATE INDEX "idx_collaborator_invitations_token" ON "collaborator_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_collaborator_invitations_status" ON "collaborator_invitations" USING btree ("status");