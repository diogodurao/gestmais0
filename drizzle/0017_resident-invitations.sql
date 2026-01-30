CREATE TABLE "resident_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" text NOT NULL,
	"invited_email" text NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"status" "collaborator_invitation_status" DEFAULT 'pending' NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resident_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "resident_invitations" ADD CONSTRAINT "resident_invitations_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resident_invitations" ADD CONSTRAINT "resident_invitations_invited_by_user_id_user_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_resident_invitations_building" ON "resident_invitations" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_resident_invitations_token" ON "resident_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_resident_invitations_status" ON "resident_invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_resident_invitations_email" ON "resident_invitations" USING btree ("invited_email");