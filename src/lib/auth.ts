import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq, and } from "drizzle-orm";
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
        requireEmailVerification: true,
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
            // Skip verification email for invited professionals and residents
            // (their email is already trusted since the manager invited them directly)
            const pendingProfessionalInvitation = await db.query.professionalInvitations.findFirst({
                where: and(
                    eq(schema.professionalInvitations.invitedEmail, user.email),
                    eq(schema.professionalInvitations.status, 'pending')
                ),
                columns: { id: true }
            })

            if (pendingProfessionalInvitation) return

            try {
                const pendingResidentInvitation = await db.query.residentInvitations.findFirst({
                    where: and(
                        eq(schema.residentInvitations.invitedEmail, user.email),
                        eq(schema.residentInvitations.status, 'pending')
                    ),
                    columns: { id: true }
                })

                if (pendingResidentInvitation) return
            } catch {
                // Table may not exist yet if migration hasn't been applied
            }

            // Regular signup - send verification email
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
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                input: false,
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