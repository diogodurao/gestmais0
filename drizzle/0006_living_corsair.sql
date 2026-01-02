CREATE TABLE "monthly_evaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" text NOT NULL,
	"user_id" text NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"security_rating" integer NOT NULL,
	"cleaning_rating" integer NOT NULL,
	"maintenance_rating" integer NOT NULL,
	"communication_rating" integer NOT NULL,
	"general_rating" integer NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_evaluation" UNIQUE("building_id","user_id","year","month")
);
--> statement-breakpoint
ALTER TABLE "monthly_evaluations" ADD CONSTRAINT "monthly_evaluations_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_evaluations" ADD CONSTRAINT "monthly_evaluations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_evaluation_building" ON "monthly_evaluations" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_evaluation_period" ON "monthly_evaluations" USING btree ("year","month");