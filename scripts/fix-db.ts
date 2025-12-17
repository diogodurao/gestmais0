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

        // 2. Add missing User columns
        await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS iban TEXT`);
        await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS active_building_id TEXT`);
        console.log("✅ Added User columns");

        // 3. Create managerBuildings junction table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS manager_buildings (
                id SERIAL PRIMARY KEY,
                manager_id TEXT NOT NULL REFERENCES "user"(id),
                building_id TEXT NOT NULL REFERENCES building(id),
                is_owner BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log("✅ Created manager_buildings table");

        // 4. Migrate apartments table to new structure
        // Add new columns if they don't exist
        await db.execute(sql`ALTER TABLE apartments ADD COLUMN IF NOT EXISTS unit_type TEXT`);
        await db.execute(sql`ALTER TABLE apartments ADD COLUMN IF NOT EXISTS identifier TEXT`);
        
        // Check if 'unit' column exists (old schema) and migrate data
        const hasUnitColumn = await db.execute(sql`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'apartments' AND column_name = 'unit'
        `);
        
        // Postgres.js returns an array-like object for result
        if (hasUnitColumn.length > 0) {
            // Migrate existing 'unit' data to 'identifier'
            await db.execute(sql`UPDATE apartments SET identifier = unit WHERE identifier IS NULL`);
            // Set default unit_type for existing records
            await db.execute(sql`UPDATE apartments SET unit_type = 'apartment' WHERE unit_type IS NULL`);
            // Drop the old 'unit' column
            await db.execute(sql`ALTER TABLE apartments DROP COLUMN IF EXISTS unit`);
            console.log("✅ Migrated 'unit' column to 'identifier'");
        }

        // Ensure floor is TEXT type (not INTEGER)
        await db.execute(sql`ALTER TABLE apartments ALTER COLUMN floor TYPE TEXT USING floor::TEXT`);
        
        // Set NOT NULL constraints where needed (only if data exists)
        await db.execute(sql`UPDATE apartments SET floor = '1' WHERE floor IS NULL`);
        await db.execute(sql`UPDATE apartments SET unit_type = 'apartment' WHERE unit_type IS NULL`);
        await db.execute(sql`UPDATE apartments SET identifier = 'A' WHERE identifier IS NULL`);
        
        // Add NOT NULL constraints
        await db.execute(sql`ALTER TABLE apartments ALTER COLUMN floor SET NOT NULL`);
        await db.execute(sql`ALTER TABLE apartments ALTER COLUMN unit_type SET NOT NULL`);
        await db.execute(sql`ALTER TABLE apartments ALTER COLUMN identifier SET NOT NULL`);
        
        // Ensure permillage is REAL type
        // Handle conversion from TEXT to REAL (handling commas vs dots)
        await db.execute(sql`
            ALTER TABLE apartments 
            ALTER COLUMN permillage TYPE REAL 
            USING (
                CASE 
                    WHEN permillage IS NULL OR permillage = '' THEN NULL 
                    ELSE REPLACE(permillage, ',', '.')::REAL 
                END
            )
        `);
        console.log("✅ Updated apartments table structure");

        // 5. Link existing buildings to managers in junction table
        await db.execute(sql`
            INSERT INTO manager_buildings (manager_id, building_id, is_owner)
            SELECT manager_id, id, TRUE FROM building
            WHERE NOT EXISTS (
                SELECT 1 FROM manager_buildings mb 
                WHERE mb.manager_id = building.manager_id AND mb.building_id = building.id
            )
        `);
        
        // Set active_building_id for managers who don't have one
        await db.execute(sql`
            UPDATE "user" u
            SET active_building_id = (
                SELECT building_id FROM manager_buildings mb 
                WHERE mb.manager_id = u.id 
                LIMIT 1
            )
            WHERE u.role = 'manager' AND u.active_building_id IS NULL
        `);
        console.log("✅ Linked managers to buildings");

        console.log("\n✅ Database schema fixed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error fixing database:", error);
        process.exit(1);
    }
}

main();
