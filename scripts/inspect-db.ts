import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Inspecting apartments table...");
    try {
        const result = await db.execute(sql`
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'apartments';
        `);
        console.table(result);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
