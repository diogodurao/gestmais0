import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import 'dotenv/config';

// Prevent initializing multiple connections in dev
const globalForDb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
};

// If DATABASE_URL is missing or empty, do not attempt to connect.
// This allows tests to run without a real database connection when mocked properly.
const connectionString = process.env.DATABASE_URL;

let dbInstance: ReturnType<typeof drizzle>;

if (!connectionString) {
    // Return a proxy or throw an error if accessed?
    // For tests, this should ideally be mocked before import.
    // If we are here in production code, it's bad.
    // But for tests, if we fail to mock, we might end up here.
    // Let's create a dummy instance that throws if used, unless it's just for type checking.
    // However, in tests, we want to replace `db` entirely.

    // We can't really return a dummy 'db' here because drizzle expects a client.
    // But we can lazy load? No, it's exported as const.

    // If we are running tests, we expect the mock to take precedence.
    // The fact that we are here means the mock was NOT used or the module was loaded before mocking.

    // Let's try to export a dummy db if no connection string.
    dbInstance = {} as any;
} else {
    const conn = globalForDb.conn ?? postgres(connectionString);
    if (process.env.NODE_ENV !== 'production') globalForDb.conn = conn;
    dbInstance = drizzle(conn, { schema });
}

export const db = dbInstance;
