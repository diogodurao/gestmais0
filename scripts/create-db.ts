import 'dotenv/config';
import postgres from 'postgres';

async function main() {
    const targetDb = 'gest-db';
    const url = process.env.DATABASE_URL;

    if (!url) {
        console.error('DATABASE_URL is not defined');
        process.exit(1);
    }

    // Connect to 'postgres' database to create the new one
    // Assumes URL format: postgres://user:pass@host:port/dbname...
    // We'll replace the last path segment with 'postgres' or just use the base URL if possible.
    // A safer way is using the URL object.

    try {
        const urlObj = new URL(url);
        urlObj.pathname = '/postgres';
        const adminUrl = urlObj.toString();

        const sql = postgres(adminUrl);

        console.log(`Checking if database "${targetDb}" exists...`);
        const result = await sql`SELECT 1 FROM pg_database WHERE datname = ${targetDb}`;

        if (result.length === 0) {
            console.log(`Database "${targetDb}" does not exist. Creating...`);
            // Cannot verify safely parameterized CREATE DATABASE, so validating name manually
            if (!/^[a-zA-Z0-9_-]+$/.test(targetDb)) {
                throw new Error('Invalid database name');
            }
            await sql.unsafe(`CREATE DATABASE "${targetDb}"`);
            console.log(`Database "${targetDb}" created successfully.`);
        } else {
            console.log(`Database "${targetDb}" already exists.`);
        }

        await sql.end();
        process.exit(0);

    } catch (error) {
        console.error('Error creating database:', error);
        process.exit(1);
    }
}

main();
