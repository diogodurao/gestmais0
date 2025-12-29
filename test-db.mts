
import postgres from 'postgres';
import 'dotenv/config';

async function testConnection() {
    console.log("Testing connection to:", process.env.DATABASE_URL?.split('@')[1]);

    const sql = postgres(process.env.DATABASE_URL!, {
        connect_timeout: 10,
    });

    try {
        const result = await sql`SELECT 1 as connected`;
        console.log("✅ Success!", result);
    } catch (error) {
        console.error("❌ Failed!");
        console.error(error);
    } finally {
        await sql.end();
    }
}

testConnection();
