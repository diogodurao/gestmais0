import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Fixing database schema...");

    try {
        // 1. Add missing Building columns
        await db.execute(sql`ALTER TABLE building ADD COLUMN IF NOT EXISTS city TEXT`);
        await db.execute(sql`ALTER TABLE building ADD COLUMN IF NOT EXISTS street TEXT`);
        await db.execute(sql`ALTER TABLE building ADD COLUMN IF NOT EXISTS number TEXT`);
        await db.execute(sql`ALTER TABLE building ADD COLUMN IF NOT EXISTS iban TEXT`);
        await db.execute(sql`ALTER TABLE building ADD COLUMN IF NOT EXISTS total_apartments INTEGER`);
        await db.execute(sql`ALTER TABLE building ADD COLUMN IF NOT EXISTS quota_mode TEXT DEFAULT 'global'`);
        await db.execute(sql`ALTER TABLE building ADD COLUMN IF NOT EXISTS monthly_quota INTEGER`);

        console.log("✅ Added Building columns");

        // 2. Add missing Apartments columns
        // Use REAL for permillage to support decimals (e.g. 16.48)
        await db.execute(sql`ALTER TABLE apartments ADD COLUMN IF NOT EXISTS permillage REAL`);
        // If it exists as INTEGER, convert it
        await db.execute(sql`ALTER TABLE apartments ALTER COLUMN permillage TYPE REAL`);

        console.log("✅ Added Apartments columns");

        // 3. Fix Floor column type (Text -> Integer)
        // We drop and recreate to avoid casting errors
        await db.execute(sql`ALTER TABLE apartments DROP COLUMN IF EXISTS floor`);
        await db.execute(sql`ALTER TABLE apartments ADD COLUMN floor INTEGER`);

        console.log("✅ Fixed Floor column type");

        // 4. Add user profile completion flag
        await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE`);
        await db.execute(sql`UPDATE "user" SET profile_complete = TRUE WHERE profile_complete IS NULL`);

        // 5. Enforce unique unit labels per building
        await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS apartments_building_unit_idx ON apartments(building_id, unit)`);

        console.log("Database schema fixed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error fixing database:", error);
        process.exit(1);
    }
}

main();
