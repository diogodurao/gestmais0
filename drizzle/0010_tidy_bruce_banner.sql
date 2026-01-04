CREATE TABLE "occurrence_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"occurrence_id" integer NOT NULL,
	"comment_id" integer,
	"file_name" text NOT NULL,
	"file_key" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" text NOT NULL,
	"uploaded_by" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "occurrence_attachments" ADD CONSTRAINT "occurrence_attachments_occurrence_id_occurrences_id_fk" FOREIGN KEY ("occurrence_id") REFERENCES "public"."occurrences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence_attachments" ADD CONSTRAINT "occurrence_attachments_comment_id_occurrence_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."occurrence_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence_attachments" ADD CONSTRAINT "occurrence_attachments_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_attachment_occurrence" ON "occurrence_attachments" USING btree ("occurrence_id");--> statement-breakpoint
CREATE INDEX "idx_attachment_comment" ON "occurrence_attachments" USING btree ("comment_id");