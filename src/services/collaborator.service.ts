import { db } from "@/db"
import { collaboratorInvitations, managerBuildings, user, building, apartments } from "@/db/schema"
import { eq, and, or, desc, inArray } from "drizzle-orm"
import { ActionResult, Ok, Err, ErrorCodes, CollaboratorInvitation, Collaborator, ManagerBuildingRole } from "@/lib/types"
import { COLLABORATOR_INVITATION_EXPIRY_DAYS } from "@/lib/constants/timing"

// ==========================================
// TYPES
// ==========================================

type CollaboratorInvitationRow = typeof collaboratorInvitations.$inferSelect
type ManagerBuildingRow = typeof managerBuildings.$inferSelect

export interface CreateInvitationInput {
    buildingId: string
    invitedUserId: string
    invitedByUserId: string
    role?: ManagerBuildingRole
}

// ==========================================
// SERVICE
// ==========================================

export class CollaboratorService {
    // ==========================================
    // INVITATION MANAGEMENT
    // ==========================================

    /**
     * Create a new collaborator invitation for an existing resident
     */
    async createInvitation(input: CreateInvitationInput): Promise<ActionResult<CollaboratorInvitationRow>> {
        const { buildingId, invitedUserId, invitedByUserId, role = 'collaborator' } = input

        // 1. Verify the invited user is a resident of this building
        const resident = await db.query.apartments.findFirst({
            where: and(
                eq(apartments.buildingId, buildingId),
                eq(apartments.residentId, invitedUserId)
            )
        })

        if (!resident) {
            return Err("User is not a resident of this building", ErrorCodes.VALIDATION_FAILED)
        }

        // 2. Check if user is already a collaborator/manager of this building
        const existingAccess = await db.query.managerBuildings.findFirst({
            where: and(
                eq(managerBuildings.buildingId, buildingId),
                eq(managerBuildings.managerId, invitedUserId)
            )
        })

        if (existingAccess) {
            return Err("User already has manager access to this building", ErrorCodes.VALIDATION_FAILED)
        }

        // 3. Check for existing pending invitation
        const existingInvitation = await db.query.collaboratorInvitations.findFirst({
            where: and(
                eq(collaboratorInvitations.buildingId, buildingId),
                eq(collaboratorInvitations.invitedUserId, invitedUserId),
                eq(collaboratorInvitations.status, 'pending')
            )
        })

        if (existingInvitation) {
            return Err("An invitation is already pending for this user", ErrorCodes.VALIDATION_FAILED)
        }

        // 4. Check inviter is not inviting themselves
        if (invitedUserId === invitedByUserId) {
            return Err("You cannot invite yourself", ErrorCodes.VALIDATION_FAILED)
        }

        // 5. Generate token and expiry
        const token = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + COLLABORATOR_INVITATION_EXPIRY_DAYS)

        // 6. Create invitation
        const [created] = await db
            .insert(collaboratorInvitations)
            .values({
                buildingId,
                invitedUserId,
                invitedByUserId,
                role,
                token,
                expiresAt,
                status: 'pending',
            })
            .returning()

        return Ok(created)
    }

    /**
     * Accept a collaborator invitation
     */
    async acceptInvitation(token: string, userId: string): Promise<ActionResult<ManagerBuildingRow>> {
        // 1. Find the invitation
        const invitation = await db.query.collaboratorInvitations.findFirst({
            where: eq(collaboratorInvitations.token, token)
        })

        if (!invitation) {
            return Err("Invitation not found", ErrorCodes.NOT_FOUND)
        }

        // 2. Verify the user is the invited user
        if (invitation.invitedUserId !== userId) {
            return Err("This invitation is not for you", ErrorCodes.FORBIDDEN)
        }

        // 3. Check invitation status
        if (invitation.status !== 'pending') {
            return Err(`Invitation has already been ${invitation.status}`, ErrorCodes.VALIDATION_FAILED)
        }

        // 4. Check expiry
        if (new Date() > invitation.expiresAt) {
            // Mark as expired
            await db
                .update(collaboratorInvitations)
                .set({ status: 'expired' })
                .where(eq(collaboratorInvitations.id, invitation.id))

            return Err("Invitation has expired", ErrorCodes.VALIDATION_FAILED)
        }

        // 5. Start transaction: update invitation + add to managerBuildings
        const [managerBuildingEntry] = await db
            .insert(managerBuildings)
            .values({
                managerId: userId,
                buildingId: invitation.buildingId,
                role: invitation.role,
                isOwner: false, // Collaborators are never owners
            })
            .returning()

        // 6. Update invitation status
        await db
            .update(collaboratorInvitations)
            .set({
                status: 'accepted',
                respondedAt: new Date(),
            })
            .where(eq(collaboratorInvitations.id, invitation.id))

        return Ok(managerBuildingEntry)
    }

    /**
     * Decline a collaborator invitation
     */
    async declineInvitation(token: string, userId: string): Promise<ActionResult<CollaboratorInvitationRow>> {
        // 1. Find the invitation
        const invitation = await db.query.collaboratorInvitations.findFirst({
            where: eq(collaboratorInvitations.token, token)
        })

        if (!invitation) {
            return Err("Invitation not found", ErrorCodes.NOT_FOUND)
        }

        // 2. Verify the user is the invited user
        if (invitation.invitedUserId !== userId) {
            return Err("This invitation is not for you", ErrorCodes.FORBIDDEN)
        }

        // 3. Check invitation status
        if (invitation.status !== 'pending') {
            return Err(`Invitation has already been ${invitation.status}`, ErrorCodes.VALIDATION_FAILED)
        }

        // 4. Update invitation status
        const [updated] = await db
            .update(collaboratorInvitations)
            .set({
                status: 'declined',
                respondedAt: new Date(),
            })
            .where(eq(collaboratorInvitations.id, invitation.id))
            .returning()

        return Ok(updated)
    }

    /**
     * Cancel a pending invitation (by the inviter/owner)
     */
    async cancelInvitation(invitationId: number, buildingId: string): Promise<ActionResult<CollaboratorInvitationRow>> {
        // 1. Find the invitation
        const invitation = await db.query.collaboratorInvitations.findFirst({
            where: and(
                eq(collaboratorInvitations.id, invitationId),
                eq(collaboratorInvitations.buildingId, buildingId)
            )
        })

        if (!invitation) {
            return Err("Invitation not found", ErrorCodes.NOT_FOUND)
        }

        // 2. Check invitation status
        if (invitation.status !== 'pending') {
            return Err(`Cannot cancel: invitation has already been ${invitation.status}`, ErrorCodes.VALIDATION_FAILED)
        }

        // 3. Update invitation status
        const [updated] = await db
            .update(collaboratorInvitations)
            .set({ status: 'cancelled' })
            .where(eq(collaboratorInvitations.id, invitationId))
            .returning()

        return Ok(updated)
    }

    // ==========================================
    // QUERIES
    // ==========================================

    /**
     * Get invitation by token
     */
    async getInvitationByToken(token: string): Promise<ActionResult<CollaboratorInvitation | null>> {
        const invitation = await db
            .select({
                id: collaboratorInvitations.id,
                buildingId: collaboratorInvitations.buildingId,
                invitedUserId: collaboratorInvitations.invitedUserId,
                invitedEmail: collaboratorInvitations.invitedEmail,
                invitedByUserId: collaboratorInvitations.invitedByUserId,
                role: collaboratorInvitations.role,
                status: collaboratorInvitations.status,
                token: collaboratorInvitations.token,
                expiresAt: collaboratorInvitations.expiresAt,
                respondedAt: collaboratorInvitations.respondedAt,
                createdAt: collaboratorInvitations.createdAt,
                invitedUserName: user.name,
                buildingName: building.name,
            })
            .from(collaboratorInvitations)
            .leftJoin(user, eq(collaboratorInvitations.invitedUserId, user.id))
            .leftJoin(building, eq(collaboratorInvitations.buildingId, building.id))
            .where(eq(collaboratorInvitations.token, token))
            .limit(1)

        if (!invitation.length) {
            return Ok(null)
        }

        return Ok(invitation[0] as CollaboratorInvitation)
    }

    /**
     * Get pending invitations for a building
     */
    async getPendingInvitationsForBuilding(buildingId: string): Promise<ActionResult<CollaboratorInvitation[]>> {
        const invitations = await db
            .select({
                id: collaboratorInvitations.id,
                buildingId: collaboratorInvitations.buildingId,
                invitedUserId: collaboratorInvitations.invitedUserId,
                invitedEmail: collaboratorInvitations.invitedEmail,
                invitedByUserId: collaboratorInvitations.invitedByUserId,
                role: collaboratorInvitations.role,
                status: collaboratorInvitations.status,
                token: collaboratorInvitations.token,
                expiresAt: collaboratorInvitations.expiresAt,
                respondedAt: collaboratorInvitations.respondedAt,
                createdAt: collaboratorInvitations.createdAt,
                invitedUserName: user.name,
            })
            .from(collaboratorInvitations)
            .leftJoin(user, eq(collaboratorInvitations.invitedUserId, user.id))
            .where(and(
                eq(collaboratorInvitations.buildingId, buildingId),
                eq(collaboratorInvitations.status, 'pending')
            ))
            .orderBy(desc(collaboratorInvitations.createdAt))

        return Ok(invitations as CollaboratorInvitation[])
    }

    /**
     * Get pending invitations for a user (resident)
     */
    async getPendingInvitationsForUser(userId: string): Promise<ActionResult<CollaboratorInvitation[]>> {
        const invitations = await db
            .select({
                id: collaboratorInvitations.id,
                buildingId: collaboratorInvitations.buildingId,
                invitedUserId: collaboratorInvitations.invitedUserId,
                invitedEmail: collaboratorInvitations.invitedEmail,
                invitedByUserId: collaboratorInvitations.invitedByUserId,
                role: collaboratorInvitations.role,
                status: collaboratorInvitations.status,
                token: collaboratorInvitations.token,
                expiresAt: collaboratorInvitations.expiresAt,
                respondedAt: collaboratorInvitations.respondedAt,
                createdAt: collaboratorInvitations.createdAt,
                invitedByUserName: user.name,
                buildingName: building.name,
            })
            .from(collaboratorInvitations)
            .leftJoin(user, eq(collaboratorInvitations.invitedByUserId, user.id))
            .leftJoin(building, eq(collaboratorInvitations.buildingId, building.id))
            .where(and(
                eq(collaboratorInvitations.invitedUserId, userId),
                eq(collaboratorInvitations.status, 'pending')
            ))
            .orderBy(desc(collaboratorInvitations.createdAt))

        return Ok(invitations as CollaboratorInvitation[])
    }

    /**
     * Get count of pending invitations for a user
     */
    async getPendingInvitationCount(userId: string): Promise<ActionResult<number>> {
        const result = await db
            .select({ id: collaboratorInvitations.id })
            .from(collaboratorInvitations)
            .where(and(
                eq(collaboratorInvitations.invitedUserId, userId),
                eq(collaboratorInvitations.status, 'pending')
            ))

        return Ok(result.length)
    }

    // ==========================================
    // COLLABORATOR MANAGEMENT
    // ==========================================

    /**
     * Get all collaborators for a building (excludes owner)
     */
    async getCollaborators(buildingId: string): Promise<ActionResult<Collaborator[]>> {
        const collaborators = await db
            .select({
                id: managerBuildings.id,
                managerId: managerBuildings.managerId,
                buildingId: managerBuildings.buildingId,
                role: managerBuildings.role,
                createdAt: managerBuildings.createdAt,
                name: user.name,
                email: user.email,
            })
            .from(managerBuildings)
            .innerJoin(user, eq(managerBuildings.managerId, user.id))
            .where(and(
                eq(managerBuildings.buildingId, buildingId),
                eq(managerBuildings.role, 'collaborator')
            ))
            .orderBy(desc(managerBuildings.createdAt))

        return Ok(collaborators)
    }

    /**
     * Remove a collaborator from a building
     */
    async removeCollaborator(buildingId: string, userId: string): Promise<ActionResult<boolean>> {
        // 1. Verify it's a collaborator (not owner)
        const entry = await db.query.managerBuildings.findFirst({
            where: and(
                eq(managerBuildings.buildingId, buildingId),
                eq(managerBuildings.managerId, userId)
            )
        })

        if (!entry) {
            return Err("Collaborator not found", ErrorCodes.NOT_FOUND)
        }

        if (entry.role === 'owner') {
            return Err("Cannot remove the building owner", ErrorCodes.FORBIDDEN)
        }

        // 2. Remove from managerBuildings
        await db
            .delete(managerBuildings)
            .where(and(
                eq(managerBuildings.buildingId, buildingId),
                eq(managerBuildings.managerId, userId)
            ))

        return Ok(true)
    }

    /**
     * Check if a user is a collaborator of a building
     */
    async isCollaborator(userId: string, buildingId: string): Promise<boolean> {
        const entry = await db.query.managerBuildings.findFirst({
            where: and(
                eq(managerBuildings.buildingId, buildingId),
                eq(managerBuildings.managerId, userId),
                eq(managerBuildings.role, 'collaborator')
            )
        })

        return !!entry
    }

    /**
     * Check if a user is the owner of a building
     */
    async isOwner(userId: string, buildingId: string): Promise<boolean> {
        const entry = await db.query.managerBuildings.findFirst({
            where: and(
                eq(managerBuildings.buildingId, buildingId),
                eq(managerBuildings.managerId, userId),
                eq(managerBuildings.role, 'owner')
            )
        })

        return !!entry
    }

    /**
     * Get a user's role for a building
     */
    async getUserRole(userId: string, buildingId: string): Promise<ActionResult<ManagerBuildingRole | null>> {
        const entry = await db.query.managerBuildings.findFirst({
            where: and(
                eq(managerBuildings.buildingId, buildingId),
                eq(managerBuildings.managerId, userId)
            )
        })

        return Ok(entry?.role ?? null)
    }

    /**
     * Get eligible residents for invitation (residents who are not already collaborators)
     */
    async getEligibleResidents(buildingId: string): Promise<ActionResult<Array<{ id: string; name: string; email: string; unit: string }>>> {
        // 1. Get all residents of the building
        const residents = await db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                unit: apartments.unit,
            })
            .from(apartments)
            .innerJoin(user, eq(apartments.residentId, user.id))
            .where(eq(apartments.buildingId, buildingId))

        if (residents.length === 0) {
            return Ok([])
        }

        // 2. Get users who already have manager access
        const existingManagers = await db
            .select({ managerId: managerBuildings.managerId })
            .from(managerBuildings)
            .where(eq(managerBuildings.buildingId, buildingId))

        const managerIds = new Set(existingManagers.map(m => m.managerId))

        // 3. Get users with pending invitations
        const pendingInvitations = await db
            .select({ invitedUserId: collaboratorInvitations.invitedUserId })
            .from(collaboratorInvitations)
            .where(and(
                eq(collaboratorInvitations.buildingId, buildingId),
                eq(collaboratorInvitations.status, 'pending')
            ))

        const pendingIds = new Set(pendingInvitations.map(p => p.invitedUserId).filter(Boolean))

        // 4. Filter out users who are already managers or have pending invitations
        const eligible = residents.filter(r =>
            !managerIds.has(r.id) && !pendingIds.has(r.id)
        )

        return Ok(eligible)
    }
}

export const collaboratorService = new CollaboratorService()
