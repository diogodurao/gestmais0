/* 
  Reconcile schema differences between initial migrations and Drizzle schema.
  Fixes 'apartments' table types and columns, adds missing columns to 'building' and 'user',
  and creates 'manager_buildings' junction table.
*/

-- 1. Restructure 'apartments' table
ALTER TABLE "apartments" ADD COLUMN "unit_type" text;
ALTER TABLE "apartments" ADD COLUMN "identifier" text;

-- Migrate data from 'unit' to 'identifier' if 'unit' exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'apartments' AND column_name = 'unit') THEN
        UPDATE "apartments" SET "identifier" = "unit";
        ALTER TABLE "apartments" DROP COLUMN "unit";
    END IF;
END $$;

-- Fix 'floor' column type and set defaults
ALTER TABLE "apartments" ALTER COLUMN "floor" TYPE text USING COALESCE("floor"::text, '1');
UPDATE "apartments" SET "unit_type" = 'apartment' WHERE "unit_type" IS NULL;
UPDATE "apartments" SET "identifier" = 'A' WHERE "identifier" IS NULL;

ALTER TABLE "apartments" ALTER COLUMN "floor" SET NOT NULL;
ALTER TABLE "apartments" ALTER COLUMN "unit_type" SET NOT NULL;
ALTER TABLE "apartments" ALTER COLUMN "identifier" SET NOT NULL;

-- 2. Update 'building' table with missing columns
ALTER TABLE "building" ADD COLUMN IF NOT EXISTS "city" text;
ALTER TABLE "building" ADD COLUMN IF NOT EXISTS "street" text;
ALTER TABLE "building" ADD COLUMN IF NOT EXISTS "number" text;
ALTER TABLE "building" ADD COLUMN IF NOT EXISTS "iban" text;
ALTER TABLE "building" ADD COLUMN IF NOT EXISTS "total_apartments" integer;
ALTER TABLE "building" ADD COLUMN IF NOT EXISTS "quota_mode" text DEFAULT 'global';
ALTER TABLE "building" ADD COLUMN IF NOT EXISTS "monthly_quota" integer;

-- 3. Update 'user' table with missing columns
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "iban" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "active_building_id" text;

-- 4. Create 'manager_buildings' junction table
CREATE TABLE IF NOT EXISTS "manager_buildings" (
	"id" serial PRIMARY KEY NOT NULL,
	"manager_id" text NOT NULL REFERENCES "user"("id"),
	"building_id" text NOT NULL REFERENCES "building"("id"),
	"is_owner" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

