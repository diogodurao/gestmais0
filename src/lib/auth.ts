import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail, getVerificationEmailTemplate, getPasswordResetEmailTemplate } from "@/lib/email";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "build_time_secret",
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    // trustedOrigins removed - rely on BETTER_AUTH_URL env var
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            const template = getPasswordResetEmailTemplate(url)
            void sendEmail({
                to: user.email,
                subject: "Recuperar palavra-passe - GestMais",
                ...template,
            })
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            // Modify the callback URL to redirect to /verify-email after verification
            const verificationUrl = new URL(url)
            verificationUrl.searchParams.set("callbackURL", "/verify-email?verified=true")

            const template = getVerificationEmailTemplate(verificationUrl.toString())
            void sendEmail({
                to: user.email,
                subject: "Verifique o seu email - GestMais",
                ...template,
            })
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
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