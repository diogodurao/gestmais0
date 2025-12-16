import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        console.log('Testing database connection...');
        const result = await db.execute(sql`SELECT NOW()`);
        console.log('Connection successful!');
        console.log('Server time:', result[0].now);
        process.exit(0);
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1);
    }
}

main();
