"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { requireBuildingAccess } from "@/lib/auth-helpers"
import { residentInvitationService } from "@/services/resident-invitation.service"
import { sendEmail, getResidentInvitationEmailTemplate } from "@/lib/email"
import { db } from "@/db"
import { building, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { ActionResult, Ok, Err, ErrorCodes, ResidentInvitation } from "@/lib/types"

// ==========================================
// INVITATION ACTIONS
// ==========================================

/**
 * Invite residents by email (bulk)
 * Creates invitations + sends emails for each valid email
 */
export async function inviteResidentsByEmail(
    buildingId: string,
    emails: string[]
): Promise<ActionResult<{ sent: number; errors: string[] }>> {
    try {
        // 1. Verify building access (owner or collaborator)
        const { session } = await requireBuildingAccess(buildingId)

        // 2. Get building details for email
        const buildingData = await db.query.building.findFirst({
            where: eq(building.id, buildingId)
        })

        if (!buildingData) {
            return Err("Edifício não encontrado", ErrorCodes.NOT_FOUND)
        }

        // 3. Process each email
        let sent = 0
        const errors: string[] = []

        for (const email of emails) {
            const normalizedEmail = email.trim().toLowerCase()
            if (!normalizedEmail) continue

            // Create invitation
            const result = await residentInvitationService.createInvitation({
                buildingId,
                invitedEmail: normalizedEmail,
                invitedByUserId: session.user.id,
            })

            if (!result.success) {
                errors.push(`${normalizedEmail}: ${result.error}`)
                continue
            }

            // Send email
            try {
                const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${result.data.token}`
                const emailTemplate = getResidentInvitationEmailTemplate(
                    normalizedEmail,
                    buildingData.name,
                    session.user.name,
                    invitationLink
                )

                await sendEmail({
                    to: normalizedEmail,
                    subject: `Convite para o edifício ${buildingData.name} - GestMais`,
                    ...emailTemplate,
                })

                sent++
            } catch (emailError) {
                console.error(`[inviteResidentsByEmail] Failed to send email to ${normalizedEmail}:`, emailError)
                errors.push(`${normalizedEmail}: Falha ao enviar email`)
            }
        }

        // 4. Revalidate
        revalidatePath('/dashboard/settings')

        return Ok({ sent, errors })
    } catch (error) {
        console.error("[inviteResidentsByEmail] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Falha ao enviar convites",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Get invitation info by token (no auth required) — for resident invite page
 */
export async function getResidentInvitationByToken(
    token: string
): Promise<ActionResult<ResidentInvitation | null>> {
    try {
        return await residentInvitationService.getInvitationByToken(token)
    } catch (error) {
        console.error("[getResidentInvitationByToken] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Falha ao obter convite",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Create a resident account from an invitation (no auth required)
 * Creates Better Auth account, sets role='resident', emailVerified=true, buildingId, nif
 */
export async function createResidentAccountFromInvitation(
    token: string,
    formData: {
        name: string
        password: string
        nif: string
    }
): Promise<ActionResult<{ success: true }>> {
    try {
        // 1. Validate the invitation
        const invitationResult = await residentInvitationService.getInvitationByToken(token)
        if (!invitationResult.success || !invitationResult.data) {
            return Err("Convite não encontrado", ErrorCodes.NOT_FOUND)
        }

        const invitation = invitationResult.data

        // 2. Check invitation status
        if (invitation.status !== 'pending') {
            return Err("Este convite já não está disponível", ErrorCodes.VALIDATION_FAILED)
        }

        // 3. Check expiry
        const expiresAt = typeof invitation.expiresAt === 'string'
            ? new Date(invitation.expiresAt)
            : invitation.expiresAt
        if (new Date() > expiresAt) {
            return Err("O convite expirou", ErrorCodes.VALIDATION_FAILED)
        }

        // 4. Validate NIF format (9 digits)
        if (!/^\d{9}$/.test(formData.nif)) {
            return Err("NIF inválido (deve ter 9 dígitos)", ErrorCodes.VALIDATION_FAILED)
        }

        // 5. Check if email already has an account
        const existingUser = await db.select({ id: user.id })
            .from(user)
            .where(eq(user.email, invitation.invitedEmail))
            .limit(1)

        if (existingUser.length > 0) {
            return Err("EMAIL_ALREADY_EXISTS", ErrorCodes.VALIDATION_FAILED)
        }

        // 6. Create user account via Better Auth
        const signUpResult = await auth.api.signUpEmail({
            body: {
                name: formData.name,
                email: invitation.invitedEmail,
                password: formData.password,
            },
            headers: await headers(),
        })

        if (!signUpResult?.user?.id) {
            return Err("Falha ao criar conta", ErrorCodes.INTERNAL_ERROR)
        }

        const userId = signUpResult.user.id

        // 7. Set role, emailVerified, buildingId, and nif
        await db
            .update(user)
            .set({
                role: 'resident',
                emailVerified: true,
                buildingId: invitation.buildingId,
                nif: formData.nif,
            })
            .where(eq(user.id, userId))

        // 8. Accept the invitation
        await residentInvitationService.acceptInvitation(token, userId)

        return Ok({ success: true })
    } catch (error) {
        console.error("[createResidentAccountFromInvitation] Error:", error)

        // Handle duplicate email error from Better Auth
        const errorMessage = error instanceof Error ? error.message : "Falha ao criar conta"
        if (errorMessage.includes("already exists") || errorMessage.includes("duplicate")) {
            return Err("EMAIL_ALREADY_EXISTS", ErrorCodes.VALIDATION_FAILED)
        }

        return Err(errorMessage, ErrorCodes.INTERNAL_ERROR)
    }
}

// ==========================================
// MANAGER QUERY ACTIONS
// ==========================================

/**
 * Get pending resident invitations for a building
 */
export async function getResidentPendingInvitations(
    buildingId: string
): Promise<ActionResult<ResidentInvitation[]>> {
    try {
        await requireBuildingAccess(buildingId)
        return await residentInvitationService.getPendingInvitationsForBuilding(buildingId)
    } catch (error) {
        console.error("[getResidentPendingInvitations] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Falha ao obter convites pendentes",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Cancel a pending resident invitation
 */
export async function cancelResidentInvitation(
    invitationId: number,
    buildingId: string
): Promise<ActionResult<boolean>> {
    try {
        await requireBuildingAccess(buildingId)

        const result = await residentInvitationService.cancelInvitation(invitationId, buildingId)

        if (!result.success) {
            return result
        }

        revalidatePath('/dashboard/settings')
        return Ok(true)
    } catch (error) {
        console.error("[cancelResidentInvitation] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Falha ao cancelar convite",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}
