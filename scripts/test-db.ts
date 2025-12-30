
import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Testing database connection...");
    // Just a simple query to check connection
    const result = await db.execute(sql`SELECT 1`);
    console.log("Database connection successful:", result);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

main();
