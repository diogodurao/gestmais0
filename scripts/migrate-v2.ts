import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Running V2 migration: Multi-building + Structured Units...\n");

    try {
        // ... (Skipping user table parts as they passed) ...
        // To be safe I'll keep them but they are idempotent (IF NOT EXISTS/Check existence)

        // ========================================
        // 1. USER TABLE UPDATES
        // ========================================
        console.log("📦 Updating User table...");
        await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS iban TEXT`);
        await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS active_building_id TEXT`);
        console.log("✅ User table updated\n");

        // ========================================
        // 2. MANAGER_BUILDINGS JUNCTION TABLE
        // ========================================
        console.log("📦 Creating manager_buildings table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS manager_buildings (
                id SERIAL PRIMARY KEY,
                manager_id TEXT NOT NULL REFERENCES "user"(id),
                building_id TEXT NOT NULL REFERENCES building(id),
                is_owner BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log("✅ manager_buildings table created\n");

        // ========================================
        // 3. MIGRATE EXISTING MANAGER RELATIONSHIPS
        // ========================================
        console.log("📦 Migrating existing manager-building relationships...");
        await db.execute(sql`
            INSERT INTO manager_buildings (manager_id, building_id, is_owner)
            SELECT manager_id, id, TRUE
            FROM building
            WHERE NOT EXISTS (
                SELECT 1 FROM manager_buildings mb 
                WHERE mb.manager_id = building.manager_id 
                AND mb.building_id = building.id
            )
        `);
        
        await db.execute(sql`
            UPDATE "user" u
            SET active_building_id = (
                SELECT building_id FROM manager_buildings mb 
                WHERE mb.manager_id = u.id 
                LIMIT 1
            )
            WHERE u.role = 'manager' 
            AND u.active_building_id IS NULL
        `);
        console.log("✅ Manager relationships migrated\n");

        // ========================================
        // 4. APARTMENTS TABLE RESTRUCTURE
        // ========================================
        console.log("📦 Restructuring apartments table...");
        
        await db.execute(sql`ALTER TABLE apartments ADD COLUMN IF NOT EXISTS unit_type TEXT`);
        await db.execute(sql`ALTER TABLE apartments ADD COLUMN IF NOT EXISTS identifier TEXT`);
        
        const unitColExists = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'apartments' AND column_name = 'unit'
        `);

        if (unitColExists.length > 0) {
             console.log("Migrating data from 'unit' column...");
             await db.execute(sql`
                UPDATE apartments 
                SET 
                    unit_type = 'apartment',
                    identifier = COALESCE(unit, 'A')
                WHERE (unit_type IS NULL OR identifier IS NULL)
             `);
        } else {
             console.log("'unit' column not found, setting defaults for new columns...");
             await db.execute(sql`
                UPDATE apartments 
                SET 
                    unit_type = 'apartment',
                    identifier = 'A'
                WHERE (unit_type IS NULL OR identifier IS NULL)
             `);
        }
        
        await db.execute(sql`
            ALTER TABLE apartments 
            ALTER COLUMN floor TYPE TEXT 
            USING COALESCE(floor::TEXT, '1')
        `);

        // FIX PERMILLAGE
        console.log("Fixing permillage column...");
        
        // 1. Drop bad default
        await db.execute(sql`ALTER TABLE apartments ALTER COLUMN permillage DROP DEFAULT`);
        
        // 2. Clean invalid data (non-numeric text)
        await db.execute(sql`
            UPDATE apartments 
            SET permillage = NULL 
            WHERE permillage !~ '^[0-9]+(\.[0-9]+)?$'
        `);

        // 3. Convert to REAL
        await db.execute(sql`
            ALTER TABLE apartments 
            ALTER COLUMN permillage TYPE REAL 
            USING permillage::REAL
        `);
        
        await db.execute(sql`ALTER TABLE apartments ALTER COLUMN floor SET NOT NULL`);
        await db.execute(sql`ALTER TABLE apartments ALTER COLUMN unit_type SET NOT NULL`);
        await db.execute(sql`ALTER TABLE apartments ALTER COLUMN identifier SET NOT NULL`);
        
        console.log("✅ Apartments table restructured\n");
        console.log("🎉 V2 migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

main();
