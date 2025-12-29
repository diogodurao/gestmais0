import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // Adjust import if needed
import * as schema from "@/db/schema";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "build_time_secret",
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    // trustedOrigins removed - rely on BETTER_AUTH_URL env var
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
            },
            nif: {
                type: "string",
                required: false,
            },
            iban: {
                type: "string",
                required: false,
            },
            buildingId: {
                type: "string",
                required: false,
            },
            activeBuildingId: {
                type: "string",
                required: false,
            },
            stripeCustomerId: {
                type: "string",
                required: false,
            }
        }
    }
});
