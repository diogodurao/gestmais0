"use server"

import { db } from "@/db"
import { user, apartments } from "@/db/schema"
import { eq, inArray, and, isNotNull } from "drizzle-orm"
import { sendEmail } from "@/lib/email"

const MAX_EMAILS_PER_ACTION = 100

export interface EmailRecipient {
    email: string
    name: string
    userId: string
}

export interface SendBulkEmailsInput {
    recipients: { email: string; name: string }[]
    subject: string
    template: { text: string; html: string }
}

export interface SendBulkEmailsResult {
    sent: number
    failed: number
}

/**
 * Send emails to multiple recipients
 * Rate limited to MAX_EMAILS_PER_ACTION recipients per call
 */
export async function sendBulkEmails(input: SendBulkEmailsInput): Promise<SendBulkEmailsResult> {
    const { recipients, subject, template } = input

    // Rate limit: max emails per action
    const limitedRecipients = recipients.slice(0, MAX_EMAILS_PER_ACTION)

    let sent = 0
    let failed = 0

    // Send emails in parallel with concurrency limit
    const batchSize = 10
    for (let i = 0; i < limitedRecipients.length; i += batchSize) {
        const batch = limitedRecipients.slice(i, i + batchSize)
        const results = await Promise.allSettled(
            batch.map(recipient =>
                sendEmail({
                    to: recipient.email,
                    subject,
                    text: template.text,
                    html: template.html,
                })
            )
        )

        for (const result of results) {
            if (result.status === 'fulfilled') {
                sent++
            } else {
                failed++
                console.error('Failed to send email:', result.reason)
            }
        }
    }

    return { sent, failed }
}

/**
 * Get email addresses for residents in a building
 * @param buildingId - The building ID
 * @param userIds - Optional array of user IDs to filter. If undefined, returns all residents.
 */
export async function getResidentEmails(
    buildingId: string,
    userIds?: string[]
): Promise<EmailRecipient[]> {
    // Get residents either from user.buildingId or apartments.residentId
    // A user is a resident of a building if:
    // 1. user.buildingId = buildingId, OR
    // 2. They have an apartment in the building

    // First, get users directly assigned to the building
    const directResidentsQuery = db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
        })
        .from(user)
        .where(
            userIds
                ? and(eq(user.buildingId, buildingId), inArray(user.id, userIds))
                : eq(user.buildingId, buildingId)
        )

    // Then, get users who have apartments in the building
    const apartmentResidentsQuery = db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
        })
        .from(apartments)
        .innerJoin(user, eq(apartments.residentId, user.id))
        .where(
            userIds
                ? and(
                    eq(apartments.buildingId, buildingId),
                    isNotNull(apartments.residentId),
                    inArray(user.id, userIds)
                )
                : and(
                    eq(apartments.buildingId, buildingId),
                    isNotNull(apartments.residentId)
                )
        )

    const [directResidents, apartmentResidents] = await Promise.all([
        directResidentsQuery,
        apartmentResidentsQuery,
    ])

    // Deduplicate by user ID
    const userMap = new Map<string, EmailRecipient>()
    for (const r of [...directResidents, ...apartmentResidents]) {
        if (!userMap.has(r.id)) {
            userMap.set(r.id, {
                userId: r.id,
                name: r.name,
                email: r.email,
            })
        }
    }

    return Array.from(userMap.values())
}

/**
 * Get manager email for a building
 */
export async function getManagerEmail(managerId: string): Promise<EmailRecipient | null> {
    const [manager] = await db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
        })
        .from(user)
        .where(eq(user.id, managerId))
        .limit(1)

    if (!manager) return null

    return {
        userId: manager.id,
        name: manager.name,
        email: manager.email,
    }
}

/**
 * Get resident info for payment overdue email
 */
export async function getResidentForPaymentEmail(apartmentId: number): Promise<{
    resident: EmailRecipient
    buildingId: string
} | null> {
    const result = await db
        .select({
            residentId: apartments.residentId,
            buildingId: apartments.buildingId,
            name: user.name,
            email: user.email,
        })
        .from(apartments)
        .innerJoin(user, eq(apartments.residentId, user.id))
        .where(eq(apartments.id, apartmentId))
        .limit(1)

    if (!result.length || !result[0].residentId) return null

    return {
        resident: {
            userId: result[0].residentId,
            name: result[0].name,
            email: result[0].email,
        },
        buildingId: result[0].buildingId,
    }
}
