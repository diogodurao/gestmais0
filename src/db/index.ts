import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import 'dotenv/config';

// Prevent initializing multiple connections in dev
const globalForDb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
};

// Configure connection pooling for better performance
const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL!, {
    max: 20,                    // Maximum pool size
    idle_timeout: 20,           // Close idle connections after 20 seconds
    connect_timeout: 10,        // Connection timeout in seconds
    prepare: false,             // Disable prepared statements for serverless compatibility
});

if (process.env.NODE_ENV !== 'production') globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
