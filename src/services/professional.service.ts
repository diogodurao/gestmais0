import { db } from "@/db"
import { professionalInvitations, buildingProfessionals, professionalProfiles, user, building } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { ActionResult, Ok, Err, ErrorCodes, ProfessionalInvitation, BuildingProfessional, ProfessionalType } from "@/lib/types"
import { PROFESSIONAL_INVITATION_EXPIRY_DAYS } from "@/lib/constants/timing"
import { PROFESSIONAL_DEFAULT_PERMISSIONS } from "@/lib/permissions"

// ==========================================
// TYPES
// ==========================================

export interface CreateProfessionalInvitationInput {
    buildingId: string
    invitedEmail: string
    professionalType: ProfessionalType
    invitedByUserId: string
}

export interface CreateProfessionalProfileInput {
    userId: string
    professionalId: string
    professionalType: ProfessionalType
    phone: string
    nif?: string
    companyName?: string
}

// ==========================================
// SERVICE
// ==========================================

export class ProfessionalService {
    // ==========================================
    // INVITATION MANAGEMENT
    // ==========================================

    /**
     * Create a new professional invitation by email
     */
    async createInvitation(input: CreateProfessionalInvitationInput): Promise<ActionResult<ProfessionalInvitation>> {
        const { buildingId, invitedEmail, professionalType, invitedByUserId } = input
        const normalizedEmail = invitedEmail.trim().toLowerCase()

        // 1. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(normalizedEmail)) {
            return Err("Email inválido", ErrorCodes.VALIDATION_FAILED)
        }

        // 2. Check for existing pending invitation for same email + building
        const existingInvitation = await db.query.professionalInvitations.findFirst({
            where: and(
                eq(professionalInvitations.buildingId, buildingId),
                eq(professionalInvitations.invitedEmail, normalizedEmail),
                eq(professionalInvitations.status, 'pending')
            )
        })

        if (existingInvitation) {
            return Err("Já existe um convite pendente para este email", ErrorCodes.VALIDATION_FAILED)
        }

        // 3. Check if email already belongs to a professional linked to this building
        const existingUser = await db.select({ id: user.id })
            .from(user)
            .where(eq(user.email, normalizedEmail))
            .limit(1)

        if (existingUser.length > 0) {
            const existingLink = await db.query.buildingProfessionals.findFirst({
                where: and(
                    eq(buildingProfessionals.professionalId, existingUser[0].id),
                    eq(buildingProfessionals.buildingId, buildingId)
                )
            })

            if (existingLink) {
                return Err("Este profissional já está associado a este edifício", ErrorCodes.VALIDATION_FAILED)
            }
        }

        // 4. Generate token and expiry
        const token = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + PROFESSIONAL_INVITATION_EXPIRY_DAYS)

        // 5. Create invitation
        const [created] = await db
            .insert(professionalInvitations)
            .values({
                buildingId,
                invitedEmail: normalizedEmail,
                invitedByUserId,
                professionalType,
                token,
                expiresAt,
                status: 'pending',
            })
            .returning()

        return Ok(created as unknown as ProfessionalInvitation)
    }

    /**
     * Get invitation by token with building and inviter info
     */
    async getInvitationByToken(token: string): Promise<ActionResult<ProfessionalInvitation | null>> {
        const invitation = await db
            .select({
                id: professionalInvitations.id,
                buildingId: professionalInvitations.buildingId,
                invitedEmail: professionalInvitations.invitedEmail,
                invitedByUserId: professionalInvitations.invitedByUserId,
                professionalType: professionalInvitations.professionalType,
                status: professionalInvitations.status,
                token: professionalInvitations.token,
                expiresAt: professionalInvitations.expiresAt,
                respondedAt: professionalInvitations.respondedAt,
                createdAt: professionalInvitations.createdAt,
                invitedByUserName: user.name,
                buildingName: building.name,
            })
            .from(professionalInvitations)
            .leftJoin(user, eq(professionalInvitations.invitedByUserId, user.id))
            .leftJoin(building, eq(professionalInvitations.buildingId, building.id))
            .where(eq(professionalInvitations.token, token))
            .limit(1)

        if (!invitation.length) {
            return Ok(null)
        }

        return Ok(invitation[0] as ProfessionalInvitation)
    }

    /**
     * Accept a professional invitation
     * Creates the buildingProfessionals entry with default permissions
     */
    async acceptInvitation(token: string, userId: string): Promise<ActionResult<boolean>> {
        // 1. Find the invitation
        const invitation = await db.query.professionalInvitations.findFirst({
            where: eq(professionalInvitations.token, token)
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
                .update(professionalInvitations)
                .set({ status: 'expired' })
                .where(eq(professionalInvitations.id, invitation.id))

            return Err("O convite expirou", ErrorCodes.VALIDATION_FAILED)
        }

        // 4. Check if already linked
        const existingLink = await db.query.buildingProfessionals.findFirst({
            where: and(
                eq(buildingProfessionals.professionalId, userId),
                eq(buildingProfessionals.buildingId, invitation.buildingId)
            )
        })

        if (existingLink) {
            // Mark invitation as accepted anyway
            await db
                .update(professionalInvitations)
                .set({ status: 'accepted', respondedAt: new Date() })
                .where(eq(professionalInvitations.id, invitation.id))

            return Ok(true)
        }

        // 5. Create buildingProfessionals entry with default permissions
        await db.insert(buildingProfessionals).values({
            professionalId: userId,
            buildingId: invitation.buildingId,
            invitedByUserId: invitation.invitedByUserId,
            professionalType: invitation.professionalType,
            ...PROFESSIONAL_DEFAULT_PERMISSIONS,
        })

        // 6. Update invitation status
        await db
            .update(professionalInvitations)
            .set({ status: 'accepted', respondedAt: new Date() })
            .where(eq(professionalInvitations.id, invitation.id))

        return Ok(true)
    }

    /**
     * Create a professional profile for a user
     */
    async createProfessionalProfile(input: CreateProfessionalProfileInput): Promise<ActionResult<boolean>> {
        const { userId, professionalId, professionalType, phone, nif, companyName } = input

        await db.insert(professionalProfiles).values({
            userId,
            professionalId,
            professionalType,
            phone,
            nif: nif || null,
            companyName: companyName || null,
        })

        return Ok(true)
    }

    // ==========================================
    // QUERIES
    // ==========================================

    /**
     * Get pending invitations for a building
     */
    async getPendingInvitationsForBuilding(buildingId: string): Promise<ActionResult<ProfessionalInvitation[]>> {
        const invitations = await db
            .select({
                id: professionalInvitations.id,
                buildingId: professionalInvitations.buildingId,
                invitedEmail: professionalInvitations.invitedEmail,
                invitedByUserId: professionalInvitations.invitedByUserId,
                professionalType: professionalInvitations.professionalType,
                status: professionalInvitations.status,
                token: professionalInvitations.token,
                expiresAt: professionalInvitations.expiresAt,
                respondedAt: professionalInvitations.respondedAt,
                createdAt: professionalInvitations.createdAt,
                invitedByUserName: user.name,
            })
            .from(professionalInvitations)
            .leftJoin(user, eq(professionalInvitations.invitedByUserId, user.id))
            .where(and(
                eq(professionalInvitations.buildingId, buildingId),
                eq(professionalInvitations.status, 'pending')
            ))
            .orderBy(desc(professionalInvitations.createdAt))

        return Ok(invitations as ProfessionalInvitation[])
    }

    /**
     * Get active professionals for a building
     */
    async getProfessionalsForBuilding(buildingId: string): Promise<ActionResult<BuildingProfessional[]>> {
        const professionals = await db
            .select({
                id: buildingProfessionals.id,
                professionalId: buildingProfessionals.professionalId,
                buildingId: buildingProfessionals.buildingId,
                professionalType: buildingProfessionals.professionalType,
                canViewPayments: buildingProfessionals.canViewPayments,
                canViewDocuments: buildingProfessionals.canViewDocuments,
                canViewReports: buildingProfessionals.canViewReports,
                canViewOccurrences: buildingProfessionals.canViewOccurrences,
                canViewPolls: buildingProfessionals.canViewPolls,
                createdAt: buildingProfessionals.createdAt,
                userName: user.name,
                userEmail: user.email,
            })
            .from(buildingProfessionals)
            .innerJoin(user, eq(buildingProfessionals.professionalId, user.id))
            .where(eq(buildingProfessionals.buildingId, buildingId))
            .orderBy(desc(buildingProfessionals.createdAt))

        return Ok(professionals as BuildingProfessional[])
    }

    /**
     * Cancel a pending invitation
     */
    async cancelInvitation(invitationId: number, buildingId: string): Promise<ActionResult<boolean>> {
        const invitation = await db.query.professionalInvitations.findFirst({
            where: and(
                eq(professionalInvitations.id, invitationId),
                eq(professionalInvitations.buildingId, buildingId)
            )
        })

        if (!invitation) {
            return Err("Convite não encontrado", ErrorCodes.NOT_FOUND)
        }

        if (invitation.status !== 'pending') {
            return Err(`Não é possível cancelar: convite já foi ${invitation.status}`, ErrorCodes.VALIDATION_FAILED)
        }

        await db
            .update(professionalInvitations)
            .set({ status: 'cancelled' })
            .where(eq(professionalInvitations.id, invitationId))

        return Ok(true)
    }

    /**
     * Remove a professional from a building
     */
    async removeProfessional(buildingId: string, professionalId: string): Promise<ActionResult<boolean>> {
        const entry = await db.query.buildingProfessionals.findFirst({
            where: and(
                eq(buildingProfessionals.buildingId, buildingId),
                eq(buildingProfessionals.professionalId, professionalId)
            )
        })

        if (!entry) {
            return Err("Profissional não encontrado", ErrorCodes.NOT_FOUND)
        }

        await db
            .delete(buildingProfessionals)
            .where(and(
                eq(buildingProfessionals.buildingId, buildingId),
                eq(buildingProfessionals.professionalId, professionalId)
            ))

        return Ok(true)
    }

    /**
     * Get professional permissions for a specific building
     */
    async getProfessionalPermissions(userId: string, buildingId: string) {
        const entry = await db.query.buildingProfessionals.findFirst({
            where: and(
                eq(buildingProfessionals.professionalId, userId),
                eq(buildingProfessionals.buildingId, buildingId)
            ),
            columns: {
                canViewPayments: true,
                canViewDocuments: true,
                canViewReports: true,
                canViewOccurrences: true,
                canViewPolls: true,
            }
        })

        return entry || null
    }
}

export const professionalService = new ProfessionalService()
