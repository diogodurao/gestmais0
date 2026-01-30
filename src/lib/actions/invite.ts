"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { professionalService } from "@/services/professional.service"
import { ActionResult, Ok, Err, ErrorCodes, ProfessionalInvitation, ProfessionalType } from "@/lib/types"

// ==========================================
// PUBLIC ACTIONS (for invite accept page)
// ==========================================

/**
 * Get invitation info by token (no auth required)
 */
export async function getInvitationByToken(
    token: string
): Promise<ActionResult<ProfessionalInvitation | null>> {
    try {
        return await professionalService.getInvitationByToken(token)
    } catch (error) {
        console.error("[getInvitationByToken] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Falha ao obter convite",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Create a new account and accept the professional invitation
 */
export async function createAccountAndAcceptInvitation(
    token: string,
    formData: {
        name: string
        email: string
        password: string
        professionalId: string
        professionalType: ProfessionalType
        phone: string
        nif?: string
        companyName?: string
    }
): Promise<ActionResult<{ success: true }>> {
    try {
        // 1. Validate the invitation
        const invitationResult = await professionalService.getInvitationByToken(token)
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

        // 4. Verify email matches
        if (formData.email.toLowerCase() !== invitation.invitedEmail.toLowerCase()) {
            return Err("O email não corresponde ao convite", ErrorCodes.VALIDATION_FAILED)
        }

        // 5. Validate cedula format (accountant: 2-6 digits; lawyer/consultant: 5-6 digits + optional letter)
        const cedulaRegex = formData.professionalType === "accountant"
            ? /^\d{2,6}$/
            : /^\d{5,6}[A-Za-z]?$/
        if (!cedulaRegex.test(formData.professionalId)) {
            return Err("Formato de cédula profissional inválido", ErrorCodes.VALIDATION_FAILED)
        }

        // 6. Create user account via Better Auth
        const signUpResult = await auth.api.signUpEmail({
            body: {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            },
            headers: await headers(),
        })

        if (!signUpResult?.user?.id) {
            return Err("Falha ao criar conta", ErrorCodes.INTERNAL_ERROR)
        }

        const userId = signUpResult.user.id

        // 7. Set role to 'professional' and mark email as verified
        //    (email is trusted since the invitation was sent to it)
        await db
            .update(user)
            .set({ role: 'professional', emailVerified: true })
            .where(eq(user.id, userId))

        // 8. Create professional profile
        await professionalService.createProfessionalProfile({
            userId,
            professionalId: formData.professionalId,
            professionalType: formData.professionalType,
            phone: formData.phone,
            nif: formData.nif,
            companyName: formData.companyName,
        })

        // 9. Accept the invitation (creates buildingProfessionals entry)
        const acceptResult = await professionalService.acceptInvitation(token, userId)
        if (!acceptResult.success) {
            return acceptResult
        }

        return Ok({ success: true })
    } catch (error) {
        console.error("[createAccountAndAcceptInvitation] Error:", error)

        // Handle duplicate email error from Better Auth
        const errorMessage = error instanceof Error ? error.message : "Falha ao criar conta"
        if (errorMessage.includes("already exists") || errorMessage.includes("duplicate")) {
            return Err("Já existe uma conta com este email. Faça login para aceitar o convite.", ErrorCodes.VALIDATION_FAILED)
        }

        return Err(errorMessage, ErrorCodes.INTERNAL_ERROR)
    }
}

/**
 * Accept an invitation with an existing account (user is already logged in)
 */
export async function acceptInvitationWithExistingAccount(
    token: string
): Promise<ActionResult<{ success: true }>> {
    try {
        // 1. Get current session
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            return Err("Precisa de estar autenticado", ErrorCodes.UNAUTHORIZED)
        }

        // 2. Get invitation
        const invitationResult = await professionalService.getInvitationByToken(token)
        if (!invitationResult.success || !invitationResult.data) {
            return Err("Convite não encontrado", ErrorCodes.NOT_FOUND)
        }

        const invitation = invitationResult.data

        // 3. Verify email matches
        if (session.user.email.toLowerCase() !== invitation.invitedEmail.toLowerCase()) {
            return Err("O email da sua conta não corresponde ao convite", ErrorCodes.VALIDATION_FAILED)
        }

        // 4. Update user role to professional if not already
        if (session.user.role !== 'professional') {
            await db
                .update(user)
                .set({ role: 'professional' })
                .where(eq(user.id, session.user.id))
        }

        // 5. Accept the invitation
        const acceptResult = await professionalService.acceptInvitation(token, session.user.id)
        if (!acceptResult.success) {
            return acceptResult
        }

        return Ok({ success: true })
    } catch (error) {
        console.error("[acceptInvitationWithExistingAccount] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Falha ao aceitar convite",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}
