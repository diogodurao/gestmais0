"use server"

import { updateTag } from "next/cache"
import { after } from "next/server"
import { requireSession, requireBuildingAccess } from "@/lib/auth-helpers"
import { occurrenceService } from "@/services/occurrence.service"
import { CreateOccurrenceInput, UpdateOccurrenceInput, OccurrenceStatus } from "@/lib/types"
import { createOccurrenceSchema, updateOccurrenceSchema } from "@/lib/zod-schemas"
import { ActionResult } from "@/lib/types"
import { notifyOccurrenceCreated, notifyOccurrenceComment, notifyOccurrenceStatus, notifyUrgentOccurrenceWithEmail } from "@/lib/actions/notification"
import { db } from "@/db"
import { building, occurrenceAttachments, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getSignedDownloadUrl } from "@/lib/r2"

interface BuildingManagerInfo {
    managerId: string
    managerName: string
    managerEmail: string
    buildingName: string
}

async function getBuildingManagerInfo(buildingId: string): Promise<BuildingManagerInfo> {
    const [result] = await db
        .select({
            managerId: building.managerId,
            buildingName: building.name,
            managerName: user.name,
            managerEmail: user.email,
        })
        .from(building)
        .innerJoin(user, eq(building.managerId, user.id))
        .where(eq(building.id, buildingId))
        .limit(1)

    if (!result) throw new Error("Building not found")
    return result
}

async function getManagerId(buildingId: string): Promise<string> {
    const result = await db
        .select({ managerId: building.managerId })
        .from(building)
        .where(eq(building.id, buildingId))
        .limit(1)

    if (!result.length) throw new Error("Building not found")
    return result[0].managerId
}

// Get all occurrences for building
export async function getOccurrences(buildingId: string, status?: OccurrenceStatus) {
    const session = await requireSession()

    // Manager or resident of building
    if (session.user.role === 'manager') {
        await requireBuildingAccess(buildingId)
    } else if (session.user.buildingId !== buildingId) {
        throw new Error("Unauthorized")
    }

    const result = await occurrenceService.getByBuilding(buildingId, status)
    if (!result.success) throw new Error(result.error)
    return result.data
}

// Get single occurrence
export async function getOccurrence(id: number) {
    const session = await requireSession()
    const result = await occurrenceService.getById(id)

    if (!result.success) throw new Error(result.error)
    if (!result.data) return null

    const occurrence = result.data

    // Verify access
    if (session.user.role === 'manager') {
        await requireBuildingAccess(occurrence.buildingId)
    } else if (session.user.buildingId !== occurrence.buildingId) {
        throw new Error("Unauthorized")
    }

    return occurrence
}

// Create occurrence (resident or manager)
export async function createOccurrence(input: CreateOccurrenceInput): Promise<ActionResult<{ id: number }>> {
    const session = await requireSession()

    // Verify building access
    if (session.user.role === 'manager') {
        await requireBuildingAccess(input.buildingId)
    } else if (session.user.buildingId !== input.buildingId) {
        return { success: false, error: "Sem permissão" }
    }

    const validated = createOccurrenceSchema.safeParse(input)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    const result = await occurrenceService.create(validated.data, session.user.id)
    if (!result.success) return { success: false, error: result.error }

    const created = result.data
    updateTag(`occurrences-${input.buildingId}`)

    // Notify after response (non-blocking)
    const isUrgent = input.priority === 'urgent'
    const creatorName = session.user.name || (session.user.role === 'manager' ? 'Gestor' : 'Um residente')

    after(async () => {
        try {
            if (isUrgent) {
                // Send urgent notification with email to ALL (residents + manager)
                const managerInfo = await getBuildingManagerInfo(input.buildingId)
                await notifyUrgentOccurrenceWithEmail(
                    input.buildingId,
                    managerInfo.buildingName,
                    input.title,
                    input.description || null,
                    creatorName,
                    created.id,
                    session.user.id // exclude creator from receiving notification
                )
            } else if (session.user.role !== 'manager') {
                // Regular notification to manager only (no email)
                const managerId = await getManagerId(input.buildingId)
                await notifyOccurrenceCreated(
                    input.buildingId,
                    managerId,
                    input.title,
                    created.id
                )
            }
        } catch (error) {
            console.error("Failed to notify:", error)
        }
    })

    return { success: true, data: { id: created.id } }
}

// Update occurrence (owner only, while open)
export async function updateOccurrence(
    id: number,
    data: UpdateOccurrenceInput
): Promise<ActionResult<void>> {
    const session = await requireSession()
    const occurrenceResult = await occurrenceService.getById(id)

    if (!occurrenceResult.success || !occurrenceResult.data) {
        return { success: false, error: "Ocorrência não encontrada" }
    }

    const occurrence = occurrenceResult.data

    // Only owner can edit
    if (occurrence.createdBy !== session.user.id) {
        return { success: false, error: "Apenas o criador pode editar" }
    }

    // Only while open
    if (occurrence.status !== "open") {
        return { success: false, error: "Só é possível editar ocorrências abertas" }
    }

    const validated = updateOccurrenceSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    const result = await occurrenceService.update(id, {
        ...validated.data,
        description: validated.data.description ?? undefined
    })
    if (!result.success) return { success: false, error: result.error }

    updateTag(`occurrences-${occurrence.buildingId}`)
    updateTag(`occurrence-${id}`)
    return { success: true, data: undefined }
}

// Delete occurrence (owner only, while open)
export async function deleteOccurrence(id: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const occurrenceResult = await occurrenceService.getById(id)

    if (!occurrenceResult.success || !occurrenceResult.data) {
        return { success: false, error: "Ocorrência não encontrada" }
    }

    const occurrence = occurrenceResult.data

    // Only owner can delete
    if (occurrence.createdBy !== session.user.id) {
        return { success: false, error: "Apenas o criador pode eliminar" }
    }

    // Only while open
    if (occurrence.status !== "open") {
        return { success: false, error: "Só é possível eliminar ocorrências abertas" }
    }

    const result = await occurrenceService.delete(id)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`occurrences-${occurrence.buildingId}`)
    return { success: true, data: undefined }
}

// Update status (manager only)
export async function updateOccurrenceStatus(
    id: number,
    status: OccurrenceStatus
): Promise<ActionResult<void>> {
    const occurrenceResult = await occurrenceService.getById(id)

    if (!occurrenceResult.success || !occurrenceResult.data) {
        return { success: false, error: "Ocorrência não encontrada" }
    }

    const occurrence = occurrenceResult.data
    const { session } = await requireBuildingAccess(occurrence.buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem alterar o estado" }
    }

    const result = await occurrenceService.updateStatus(id, status)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`occurrences-${occurrence.buildingId}`)
    updateTag(`occurrence-${id}`)

    // Notify creator after response (non-blocking)
    after(async () => {
        try {
            await notifyOccurrenceStatus(
                occurrence.buildingId,
                occurrence.createdBy,
                occurrence.title,
                status,
                id
            )
        } catch (error) {
            console.error("Failed to notify user:", error)
        }
    })

    return { success: true, data: undefined }
}

// Get comments
export async function getOccurrenceComments(occurrenceId: number) {
    await requireSession()
    const result = await occurrenceService.getComments(occurrenceId)
    if (!result.success) throw new Error(result.error)
    return result.data
}

// Add comment (anyone with building access)
export async function addOccurrenceComment(
    occurrenceId: number,
    content: string
): Promise<ActionResult<{ commentId: number }>> {
    const session = await requireSession()
    const occurrenceResult = await occurrenceService.getById(occurrenceId)

    if (!occurrenceResult.success || !occurrenceResult.data) {
        return { success: false, error: "Ocorrência não encontrada" }
    }

    const occurrence = occurrenceResult.data

    // Verify building access
    if (session.user.role === 'manager') {
        await requireBuildingAccess(occurrence.buildingId)
    } else if (session.user.buildingId !== occurrence.buildingId) {
        return { success: false, error: "Sem permissão" }
    }

    if (!content.trim()) {
        return { success: false, error: "Comentário não pode estar vazio" }
    }

    const result = await occurrenceService.addComment(occurrenceId, content.trim(), session.user.id)
    if (!result.success) return { success: false, error: result.error }

    const created = result.data
    updateTag(`occurrence-comments-${occurrenceId}`)

    // Notify creator after response (non-blocking)
    if (occurrence.createdBy !== session.user.id) {
        const commenterName = session.user.name || 'Alguém'
        after(async () => {
            try {
                await notifyOccurrenceComment(
                    occurrence.buildingId,
                    occurrence.createdBy,
                    commenterName,
                    occurrence.title,
                    occurrenceId
                )
            } catch (error) {
                console.error("Failed to notify user:", error)
            }
        })
    }

    return { success: true, data: { commentId: created.id } }
}

// Get occurrence attachments
export async function getOccurrenceAttachments(occurrenceId: number) {
    const session = await requireSession()
    const occurrenceResult = await occurrenceService.getById(occurrenceId)

    if (!occurrenceResult.success || !occurrenceResult.data) return []

    const occurrence = occurrenceResult.data

    if (session.user.role === 'manager') {
        await requireBuildingAccess(occurrence.buildingId)
    } else if (session.user.buildingId !== occurrence.buildingId) {
        throw new Error("Unauthorized")
    }

    const attachmentsResult = await occurrenceService.getOccurrenceAttachments(occurrenceId)
    if (!attachmentsResult.success) return []

    const attachments = attachmentsResult.data

    // Generate signed URLs for attachments if they are not already public URLs
    return await Promise.all(attachments.map(async (attachment) => {
        if (!attachment.fileUrl.startsWith('http')) {
            const signedUrl = await getSignedDownloadUrl(attachment.fileKey)
            return { ...attachment, fileUrl: signedUrl }
        }
        return attachment
    }))
}

// Get comment attachments
export async function getCommentAttachments(commentId: number) {
    await requireSession()
    const result = await occurrenceService.getCommentAttachments(commentId)
    if (!result.success) return []

    const attachments = result.data

    // Generate signed URLs
    return await Promise.all(attachments.map(async (attachment) => {
        if (!attachment.fileUrl.startsWith('http')) {
            const signedUrl = await getSignedDownloadUrl(attachment.fileKey)
            return { ...attachment, fileUrl: signedUrl }
        }
        return attachment
    }))
}

// Delete attachment (owner only, while occurrence is open)
export async function deleteOccurrenceAttachment(attachmentId: number): Promise<ActionResult<void>> {
    const session = await requireSession()

    // Get attachment to check ownership
    const [attachment] = await db
        .select()
        .from(occurrenceAttachments)
        .where(eq(occurrenceAttachments.id, attachmentId))
        .limit(1)

    if (!attachment) {
        return { success: false, error: "Anexo não encontrado" }
    }

    // Check if user owns the attachment
    if (attachment.uploadedBy !== session.user.id && session.user.role !== 'manager') {
        return { success: false, error: "Sem permissão" }
    }

    // Check if occurrence is still open
    const occurrenceResult = await occurrenceService.getById(attachment.occurrenceId)
    if (!occurrenceResult.success || !occurrenceResult.data || occurrenceResult.data.status === 'resolved') {
        return { success: false, error: "Ocorrência já está resolvida" }
    }

    const result = await occurrenceService.deleteAttachment(attachmentId)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`occurrence-attachments-${attachment.occurrenceId}`)
    return { success: true, data: undefined }
}