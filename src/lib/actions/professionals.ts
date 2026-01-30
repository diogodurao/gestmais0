"use server"

import { revalidatePath } from "next/cache"
import { requireBuildingAccess } from "@/lib/auth-helpers"
import { professionalService } from "@/services/professional.service"
import { sendEmail, getProfessionalInvitationEmailTemplate } from "@/lib/email"
import { db } from "@/db"
import { building } from "@/db/schema"
import { eq } from "drizzle-orm"
import { ActionResult, Ok, Err, ErrorCodes, ProfessionalInvitation, BuildingProfessional, ProfessionalType } from "@/lib/types"

// ==========================================
// INVITATION ACTIONS
// ==========================================

/**
 * Invite an external professional by email
 * Both building owners and collaborators can invite
 */
export async function inviteProfessional(
    buildingId: string,
    email: string,
    professionalType: ProfessionalType
): Promise<ActionResult<ProfessionalInvitation>> {
    try {
        // 1. Verify building access (owner or collaborator)
        const { session } = await requireBuildingAccess(buildingId)

        // 2. Create invitation
        const result = await professionalService.createInvitation({
            buildingId,
            invitedEmail: email,
            professionalType,
            invitedByUserId: session.user.id,
        })

        if (!result.success) {
            return result
        }

        // 3. Get building details for email
        const buildingData = await db.query.building.findFirst({
            where: eq(building.id, buildingId)
        })

        if (!buildingData) {
            return Err("Edifício não encontrado", ErrorCodes.NOT_FOUND)
        }

        // 4. Send email invitation
        const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${result.data.token}`
        const emailTemplate = getProfessionalInvitationEmailTemplate(
            email,
            buildingData.name,
            session.user.name,
            professionalType,
            invitationLink
        )

        await sendEmail({
            to: email,
            subject: `Convite para colaborar na gestão de condomínio - GestMais`,
            ...emailTemplate,
        })

        // 5. Revalidate and return
        revalidatePath('/dashboard/professionals')

        return Ok(result.data)
    } catch (error) {
        console.error("[inviteProfessional] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Falha ao enviar convite",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Cancel a pending professional invitation
 */
export async function cancelProfessionalInvitation(
    invitationId: number,
    buildingId: string
): Promise<ActionResult<boolean>> {
    try {
        await requireBuildingAccess(buildingId)

        const result = await professionalService.cancelInvitation(invitationId, buildingId)

        if (!result.success) {
            return result
        }

        revalidatePath('/dashboard/professionals')
        return Ok(true)
    } catch (error) {
        console.error("[cancelProfessionalInvitation] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Falha ao cancelar convite",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Remove a professional from the building
 */
export async function removeProfessional(
    buildingId: string,
    professionalId: string
): Promise<ActionResult<boolean>> {
    try {
        await requireBuildingAccess(buildingId)

        const result = await professionalService.removeProfessional(buildingId, professionalId)

        if (!result.success) {
            return result
        }

        revalidatePath('/dashboard/professionals')
        return Ok(true)
    } catch (error) {
        console.error("[removeProfessional] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Falha ao remover profissional",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

// ==========================================
// QUERY ACTIONS
// ==========================================

/**
 * Get all professionals for a building
 */
export async function getBuildingProfessionals(
    buildingId: string
): Promise<ActionResult<BuildingProfessional[]>> {
    try {
        await requireBuildingAccess(buildingId)
        return await professionalService.getProfessionalsForBuilding(buildingId)
    } catch (error) {
        console.error("[getBuildingProfessionals] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Falha ao obter profissionais",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Get pending professional invitations for a building
 */
export async function getBuildingPendingProfessionalInvitations(
    buildingId: string
): Promise<ActionResult<ProfessionalInvitation[]>> {
    try {
        await requireBuildingAccess(buildingId)
        return await professionalService.getPendingInvitationsForBuilding(buildingId)
    } catch (error) {
        console.error("[getBuildingPendingProfessionalInvitations] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Falha ao obter convites pendentes",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}
