CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"file_name" text NOT NULL,
	"file_key" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"original_id" integer,
	"uploaded_by" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_document_building" ON "documents" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_document_category" ON "documents" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_document_original" ON "documents" USING btree ("original_id");