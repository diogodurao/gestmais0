"use server"

import { revalidatePath } from "next/cache"
import { requireSession, requireBuildingAccess, requireBuildingOwnerAccess } from "@/lib/auth-helpers"
import { collaboratorService } from "@/services/collaborator.service"
import { notificationService } from "@/services/notification.service"
import { sendEmail, getCollaboratorInvitationEmailTemplate } from "@/lib/email"
import { db } from "@/db"
import { building, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { ActionResult, Ok, Err, ErrorCodes, CollaboratorInvitation, Collaborator } from "@/lib/types"
import { ROUTES } from "@/lib/routes"

// ==========================================
// INVITATION ACTIONS
// ==========================================

/**
 * Invite a resident to become a collaborator
 * Only building owners can invite collaborators
 */
export async function inviteCollaborator(
    buildingId: string,
    residentId: string
): Promise<ActionResult<CollaboratorInvitation>> {
    try {
        // 1. Verify owner access
        const { session } = await requireBuildingOwnerAccess(buildingId)

        // 2. Create invitation
        const result = await collaboratorService.createInvitation({
            buildingId,
            invitedUserId: residentId,
            invitedByUserId: session.user.id,
            role: 'collaborator',
        })

        if (!result.success) {
            return result
        }

        // 3. Get building and user details for notification
        const [buildingData, invitedUser] = await Promise.all([
            db.query.building.findFirst({ where: eq(building.id, buildingId) }),
            db.query.user.findFirst({ where: eq(user.id, residentId) }),
        ])

        if (!buildingData || !invitedUser) {
            return Err("Building or user not found", ErrorCodes.NOT_FOUND)
        }

        // 4. Send in-app notification
        await notificationService.create({
            buildingId,
            userId: residentId,
            type: 'collaborator_invited',
            title: 'Convite para Colaborador',
            message: `Foi convidado para colaborar na gestão do edifício "${buildingData.name}"`,
            link: ROUTES.DASHBOARD.INVITATIONS,
        })

        // 5. Send email notification
        const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invitations?token=${result.data.token}`
        const emailTemplate = getCollaboratorInvitationEmailTemplate(
            invitedUser.name,
            buildingData.name,
            session.user.name,
            invitationLink
        )

        await sendEmail({
            to: invitedUser.email,
            subject: `Convite para colaborar - ${buildingData.name}`,
            ...emailTemplate,
        })

        // 6. Revalidate and return
        revalidatePath('/dashboard/collaborators')

        // Return with joined data
        return Ok({
            ...result.data,
            invitedUserName: invitedUser.name,
            buildingName: buildingData.name,
        } as CollaboratorInvitation)
    } catch (error) {
        console.error("[inviteCollaborator] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Failed to send invitation",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Accept a collaborator invitation
 * Called by the invited resident
 */
export async function acceptCollaboratorInvitation(
    token: string
): Promise<ActionResult<{ buildingId: string; buildingName: string }>> {
    try {
        const session = await requireSession()

        // 1. Accept the invitation
        const result = await collaboratorService.acceptInvitation(token, session.user.id)

        if (!result.success) {
            return result
        }

        // 2. Get invitation details for notification
        const invitationResult = await collaboratorService.getInvitationByToken(token)
        if (!invitationResult.success || !invitationResult.data) {
            return Err("Invitation not found", ErrorCodes.NOT_FOUND)
        }

        const invitation = invitationResult.data

        // 3. Get building details
        const buildingData = await db.query.building.findFirst({
            where: eq(building.id, result.data.buildingId)
        })

        if (!buildingData) {
            return Err("Building not found", ErrorCodes.NOT_FOUND)
        }

        // 4. Notify the inviter that the invitation was accepted
        await notificationService.create({
            buildingId: result.data.buildingId,
            userId: invitation.invitedByUserId,
            type: 'collaborator_accepted',
            title: 'Convite Aceite',
            message: `${session.user.name} aceitou o convite para colaborar no edifício "${buildingData.name}"`,
            link: ROUTES.DASHBOARD.COLLABORATORS,
        })

        // 5. Revalidate paths
        revalidatePath('/dashboard/invitations')
        revalidatePath('/dashboard/collaborators')
        revalidatePath('/dashboard')

        return Ok({
            buildingId: result.data.buildingId,
            buildingName: buildingData.name,
        })
    } catch (error) {
        console.error("[acceptCollaboratorInvitation] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Failed to accept invitation",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Decline a collaborator invitation
 * Called by the invited resident
 */
export async function declineCollaboratorInvitation(
    token: string
): Promise<ActionResult<boolean>> {
    try {
        const session = await requireSession()

        // 1. Get invitation details first (for notification)
        const invitationResult = await collaboratorService.getInvitationByToken(token)
        if (!invitationResult.success || !invitationResult.data) {
            return Err("Invitation not found", ErrorCodes.NOT_FOUND)
        }

        const invitation = invitationResult.data

        // 2. Decline the invitation
        const result = await collaboratorService.declineInvitation(token, session.user.id)

        if (!result.success) {
            return result
        }

        // 3. Notify the inviter that the invitation was declined
        await notificationService.create({
            buildingId: invitation.buildingId,
            userId: invitation.invitedByUserId,
            type: 'collaborator_declined',
            title: 'Convite Recusado',
            message: `${session.user.name} recusou o convite para colaborar no edifício "${invitation.buildingName}"`,
            link: ROUTES.DASHBOARD.COLLABORATORS,
        })

        // 4. Revalidate paths
        revalidatePath('/dashboard/invitations')
        revalidatePath('/dashboard/collaborators')

        return Ok(true)
    } catch (error) {
        console.error("[declineCollaboratorInvitation] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Failed to decline invitation",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Cancel a pending invitation
 * Called by the building owner
 */
export async function cancelCollaboratorInvitation(
    invitationId: number,
    buildingId: string
): Promise<ActionResult<boolean>> {
    try {
        // 1. Verify owner access
        await requireBuildingOwnerAccess(buildingId)

        // 2. Cancel the invitation
        const result = await collaboratorService.cancelInvitation(invitationId, buildingId)

        if (!result.success) {
            return result
        }

        // 3. Revalidate paths
        revalidatePath('/dashboard/collaborators')

        return Ok(true)
    } catch (error) {
        console.error("[cancelCollaboratorInvitation] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Failed to cancel invitation",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

// ==========================================
// COLLABORATOR MANAGEMENT ACTIONS
// ==========================================

/**
 * Remove a collaborator from the building
 * Only building owners can remove collaborators
 */
export async function removeCollaborator(
    buildingId: string,
    userId: string
): Promise<ActionResult<boolean>> {
    try {
        // 1. Verify owner access
        await requireBuildingOwnerAccess(buildingId)

        // 2. Remove the collaborator
        const result = await collaboratorService.removeCollaborator(buildingId, userId)

        if (!result.success) {
            return result
        }

        // 3. Revalidate paths
        revalidatePath('/dashboard/collaborators')

        return Ok(true)
    } catch (error) {
        console.error("[removeCollaborator] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Failed to remove collaborator",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

// ==========================================
// QUERY ACTIONS
// ==========================================

/**
 * Get all collaborators for a building
 */
export async function getBuildingCollaborators(
    buildingId: string
): Promise<ActionResult<Collaborator[]>> {
    try {
        // Verify building access (both owners and collaborators can view)
        await requireBuildingAccess(buildingId)

        return await collaboratorService.getCollaborators(buildingId)
    } catch (error) {
        console.error("[getBuildingCollaborators] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Failed to get collaborators",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Get pending invitations for a building
 */
export async function getBuildingPendingInvitations(
    buildingId: string
): Promise<ActionResult<CollaboratorInvitation[]>> {
    try {
        // Verify owner access (only owners can see pending invitations)
        await requireBuildingOwnerAccess(buildingId)

        return await collaboratorService.getPendingInvitationsForBuilding(buildingId)
    } catch (error) {
        console.error("[getBuildingPendingInvitations] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Failed to get pending invitations",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Get pending invitations for the current user (resident)
 */
export async function getMyPendingInvitations(): Promise<ActionResult<CollaboratorInvitation[]>> {
    try {
        const session = await requireSession()

        return await collaboratorService.getPendingInvitationsForUser(session.user.id)
    } catch (error) {
        console.error("[getMyPendingInvitations] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Failed to get invitations",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Get count of pending invitations for the current user
 */
export async function getMyPendingInvitationCount(): Promise<ActionResult<number>> {
    try {
        const session = await requireSession()

        return await collaboratorService.getPendingInvitationCount(session.user.id)
    } catch (error) {
        console.error("[getMyPendingInvitationCount] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Failed to get invitation count",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}

/**
 * Get eligible residents for invitation
 */
export async function getEligibleResidentsForInvitation(
    buildingId: string
): Promise<ActionResult<Array<{ id: string; name: string; email: string; unit: string }>>> {
    try {
        // Verify owner access
        await requireBuildingOwnerAccess(buildingId)

        return await collaboratorService.getEligibleResidents(buildingId)
    } catch (error) {
        console.error("[getEligibleResidentsForInvitation] Error:", error)
        return Err(
            error instanceof Error ? error.message : "Failed to get eligible residents",
            ErrorCodes.INTERNAL_ERROR
        )
    }
}
