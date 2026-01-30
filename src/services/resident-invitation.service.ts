import { db } from "@/db"
import { residentInvitations, user, building } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { ActionResult, Ok, Err, ErrorCodes, ResidentInvitation } from "@/lib/types"
import { RESIDENT_INVITATION_EXPIRY_DAYS } from "@/lib/constants/timing"

// ==========================================
// TYPES
// ==========================================

export interface CreateResidentInvitationInput {
    buildingId: string
    invitedEmail: string
    invitedByUserId: string
}

// ==========================================
// SERVICE
// ==========================================

export class ResidentInvitationService {
    // ==========================================
    // INVITATION MANAGEMENT
    // ==========================================

    /**
     * Create a new resident invitation by email
     */
    async createInvitation(input: CreateResidentInvitationInput): Promise<ActionResult<ResidentInvitation>> {
        const { buildingId, invitedEmail, invitedByUserId } = input
        const normalizedEmail = invitedEmail.trim().toLowerCase()

        // 1. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(normalizedEmail)) {
            return Err("Email inválido", ErrorCodes.VALIDATION_FAILED)
        }

        // 2. Check for existing pending invitation for same email + building
        const existingInvitation = await db.query.residentInvitations.findFirst({
            where: and(
                eq(residentInvitations.buildingId, buildingId),
                eq(residentInvitations.invitedEmail, normalizedEmail),
                eq(residentInvitations.status, 'pending')
            )
        })

        if (existingInvitation) {
            return Err("Já existe um convite pendente para este email", ErrorCodes.VALIDATION_FAILED)
        }

        // 3. Check if email already belongs to a user in this building
        const existingUser = await db.select({ id: user.id, buildingId: user.buildingId })
            .from(user)
            .where(eq(user.email, normalizedEmail))
            .limit(1)

        if (existingUser.length > 0 && existingUser[0].buildingId === buildingId) {
            return Err("Este utilizador já pertence a este edifício", ErrorCodes.VALIDATION_FAILED)
        }

        // 4. Generate token and expiry
        const token = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + RESIDENT_INVITATION_EXPIRY_DAYS)

        // 5. Create invitation
        const [created] = await db
            .insert(residentInvitations)
            .values({
                buildingId,
                invitedEmail: normalizedEmail,
                invitedByUserId,
                token,
                expiresAt,
                status: 'pending',
            })
            .returning()

        return Ok(created as unknown as ResidentInvitation)
    }

    /**
     * Get invitation by token with building and inviter info
     */
    async getInvitationByToken(token: string): Promise<ActionResult<ResidentInvitation | null>> {
        const invitation = await db
            .select({
                id: residentInvitations.id,
                buildingId: residentInvitations.buildingId,
                invitedEmail: residentInvitations.invitedEmail,
                invitedByUserId: residentInvitations.invitedByUserId,
                status: residentInvitations.status,
                token: residentInvitations.token,
                expiresAt: residentInvitations.expiresAt,
                respondedAt: residentInvitations.respondedAt,
                createdAt: residentInvitations.createdAt,
                invitedByUserName: user.name,
                buildingName: building.name,
            })
            .from(residentInvitations)
            .leftJoin(user, eq(residentInvitations.invitedByUserId, user.id))
            .leftJoin(building, eq(residentInvitations.buildingId, building.id))
            .where(eq(residentInvitations.token, token))
            .limit(1)

        if (!invitation.length) {
            return Ok(null)
        }

        return Ok(invitation[0] as ResidentInvitation)
    }

    /**
     * Accept a resident invitation
     */
    async acceptInvitation(token: string, userId: string): Promise<ActionResult<boolean>> {
        // 1. Find the invitation
        const invitation = await db.query.residentInvitations.findFirst({
            where: eq(residentInvitations.token, token)
        })

        if (!invitation) {
            return Err("Convite não encontrado", ErrorCodes.NOT_FOUND)
        }

        // 2. Check status
        if (invitation.status !== 'pending') {
            return Err(`O convite já foi ${invitation.status === 'accepted' ? 'aceite' : invitation.status === 'cancelled' ? 'cancelado' : 'expirado'}`, ErrorCodes.VALIDATION_FAILED)
        }

        // 3. Check expiry
        if (new Date() > invitation.expiresAt) {
            await db
                .update(residentInvitations)
                .set({ status: 'expired' })
                .where(eq(residentInvitations.id, invitation.id))

            return Err("O convite expirou", ErrorCodes.VALIDATION_FAILED)
        }

        // 4. Update user: set buildingId
        await db
            .update(user)
            .set({ buildingId: invitation.buildingId })
            .where(eq(user.id, userId))

        // 5. Update invitation status
        await db
            .update(residentInvitations)
            .set({ status: 'accepted', respondedAt: new Date() })
            .where(eq(residentInvitations.id, invitation.id))

        return Ok(true)
    }

    // ==========================================
    // QUERIES
    // ==========================================

    /**
     * Get pending invitations for a building
     */
    async getPendingInvitationsForBuilding(buildingId: string): Promise<ActionResult<ResidentInvitation[]>> {
        const invitations = await db
            .select({
                id: residentInvitations.id,
                buildingId: residentInvitations.buildingId,
                invitedEmail: residentInvitations.invitedEmail,
                invitedByUserId: residentInvitations.invitedByUserId,
                status: residentInvitations.status,
                token: residentInvitations.token,
                expiresAt: residentInvitations.expiresAt,
                respondedAt: residentInvitations.respondedAt,
                createdAt: residentInvitations.createdAt,
                invitedByUserName: user.name,
            })
            .from(residentInvitations)
            .leftJoin(user, eq(residentInvitations.invitedByUserId, user.id))
            .where(and(
                eq(residentInvitations.buildingId, buildingId),
                eq(residentInvitations.status, 'pending')
            ))
            .orderBy(desc(residentInvitations.createdAt))

        return Ok(invitations as ResidentInvitation[])
    }

    /**
     * Cancel a pending invitation
     */
    async cancelInvitation(invitationId: number, buildingId: string): Promise<ActionResult<boolean>> {
        const invitation = await db.query.residentInvitations.findFirst({
            where: and(
                eq(residentInvitations.id, invitationId),
                eq(residentInvitations.buildingId, buildingId)
            )
        })

        if (!invitation) {
            return Err("Convite não encontrado", ErrorCodes.NOT_FOUND)
        }

        if (invitation.status !== 'pending') {
            return Err(`Não é possível cancelar: convite já foi ${invitation.status}`, ErrorCodes.VALIDATION_FAILED)
        }

        await db
            .update(residentInvitations)
            .set({ status: 'cancelled' })
            .where(eq(residentInvitations.id, invitationId))

        return Ok(true)
    }
}

export const residentInvitationService = new ResidentInvitationService()
