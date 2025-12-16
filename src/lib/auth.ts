import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // Adjust import if needed
import * as schema from "@/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    trustedOrigins: [
        "http://localhost:3000",
        "http://172.20.10.3:3000" // Mobile testing
    ],
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false, // Optional initially, but we'll enforce in UI
            },
            nif: {
                type: "string",
                required: false,
            },
            buildingId: {
                type: "string",
                required: false,
            },
            iban: {
                type: "string",
                required: false,
            }
        }
    }
});
