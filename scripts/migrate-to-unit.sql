-- Migration: Combine floor/unitType/identifier into single 'unit' column
-- Run this BEFORE running drizzle-kit push

-- Step 1: Add the new 'unit' column
ALTER TABLE "apartments" ADD COLUMN IF NOT EXISTS "unit" text;

-- Step 2: Populate 'unit' from existing data
UPDATE "apartments" 
SET "unit" = CASE 
    WHEN "floor" = '0' THEN 'R/C ' || "identifier"
    WHEN "floor" = '-1' THEN 'Cave ' || "identifier"
    WHEN "floor" = '-2' THEN '-2º ' || "identifier"
    WHEN "unit_type" = 'shop' THEN 'Loja ' || "identifier"
    WHEN "unit_type" = 'garage' THEN 'Garagem ' || "identifier"
    WHEN "unit_type" = 'storage' THEN 'Arrecadação ' || "identifier"
    ELSE "floor" || 'º ' || "identifier"
END
WHERE "unit" IS NULL;

-- Step 3: Set NOT NULL constraint
ALTER TABLE "apartments" ALTER COLUMN "unit" SET NOT NULL;

-- Step 4: Drop old columns (run after verifying data is correct)
ALTER TABLE "apartments" DROP COLUMN IF EXISTS "floor";
ALTER TABLE "apartments" DROP COLUMN IF EXISTS "unit_type";
ALTER TABLE "apartments" DROP COLUMN IF EXISTS "identifier";

