"use server"

import { revalidatePath } from "next/cache"
import { requireSession, requireBuildingAccess } from "@/lib/session"
import { occurrenceService } from "@/services/occurrence.service"
import { CreateOccurrenceInput, UpdateOccurrenceInput, OccurrenceStatus } from "@/lib/types"
import { createOccurrenceSchema, updateOccurrenceSchema } from "@/lib/zod-schemas"
import { ActionResult } from "@/lib/types"
import { notifyOccurrenceCreated, notifyOccurrenceComment, notifyOccurrenceStatus } from "@/app/actions/notification"
import { db } from "@/db"
import { building, occurrenceAttachments } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getSignedDownloadUrl } from "@/lib/r2"

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

    return await occurrenceService.getByBuilding(buildingId, status)
}

// Get single occurrence
export async function getOccurrence(id: number) {
    const session = await requireSession()
    const occurrence = await occurrenceService.getById(id)

    if (!occurrence) return null

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

    try {
        const created = await occurrenceService.create(validated.data, session.user.id)

        // Notify manager if created by resident
        if (session.user.role !== 'manager') {
            try {
                const managerId = await getManagerId(input.buildingId)
                await notifyOccurrenceCreated(
                    input.buildingId,
                    managerId,
                    input.title,
                    created.id
                )
            } catch (error) {
                console.error("Failed to notify manager:", error)
            }
        }

        revalidatePath("/dashboard/occurrences")
        return { success: true, data: { id: created.id } }
    } catch {
        return { success: false, error: "Erro ao criar ocorrência" }
    }
}

// Update occurrence (owner only, while open)
export async function updateOccurrence(
    id: number,
    data: UpdateOccurrenceInput
): Promise<ActionResult<void>> {
    const session = await requireSession()
    const occurrence = await occurrenceService.getById(id)

    if (!occurrence) {
        return { success: false, error: "Ocorrência não encontrada" }
    }

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

    try {
        await occurrenceService.update(id, {
            ...validated.data,
            description: validated.data.description ?? undefined
        })
        revalidatePath("/dashboard/occurrences")
        revalidatePath(`/dashboard/occurrences/${id}`)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao atualizar ocorrência" }
    }
}

// Delete occurrence (owner only, while open)
export async function deleteOccurrence(id: number): Promise<ActionResult<void>> {
    const session = await requireSession()
    const occurrence = await occurrenceService.getById(id)

    if (!occurrence) {
        return { success: false, error: "Ocorrência não encontrada" }
    }

    // Only owner can delete
    if (occurrence.createdBy !== session.user.id) {
        return { success: false, error: "Apenas o criador pode eliminar" }
    }

    // Only while open
    if (occurrence.status !== "open") {
        return { success: false, error: "Só é possível eliminar ocorrências abertas" }
    }

    try {
        await occurrenceService.delete(id)
        revalidatePath("/dashboard/occurrences")
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao eliminar ocorrência" }
    }
}

// Update status (manager only)
export async function updateOccurrenceStatus(
    id: number,
    status: OccurrenceStatus
): Promise<ActionResult<void>> {
    const { session } = await requireBuildingAccess(
        (await occurrenceService.getById(id))?.buildingId || ""
    )

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem alterar o estado" }
    }

    try {
        await occurrenceService.updateStatus(id, status)

        // Notify creator
        const occurrence = await occurrenceService.getById(id)
        if (occurrence) {
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
        }

        revalidatePath("/dashboard/occurrences")
        revalidatePath(`/dashboard/occurrences/${id}`)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao alterar estado" }
    }
}

// Get comments
export async function getOccurrenceComments(occurrenceId: number) {
    await requireSession()
    return await occurrenceService.getComments(occurrenceId)
}

// Add comment (anyone with building access)
export async function addOccurrenceComment(
    occurrenceId: number,
    content: string
): Promise<ActionResult<{ commentId: number }>> {
    const session = await requireSession()
    const occurrence = await occurrenceService.getById(occurrenceId)

    if (!occurrence) {
        return { success: false, error: "Ocorrência não encontrada" }
    }

    // Verify building access
    if (session.user.role === 'manager') {
        await requireBuildingAccess(occurrence.buildingId)
    } else if (session.user.buildingId !== occurrence.buildingId) {
        return { success: false, error: "Sem permissão" }
    }

    if (!content.trim()) {
        return { success: false, error: "Comentário não pode estar vazio" }
    }

    try {
        const created = await occurrenceService.addComment(occurrenceId, content.trim(), session.user.id)

        // Notify creator if comment is not from them
        if (occurrence.createdBy !== session.user.id) {
            try {
                await notifyOccurrenceComment(
                    occurrence.buildingId,
                    occurrence.createdBy,
                    session.user.name || 'Alguém',
                    occurrence.title,
                    occurrenceId
                )
            } catch (error) {
                console.error("Failed to notify user:", error)
            }
        }

        revalidatePath(`/dashboard/occurrences/${occurrenceId}`)
        return { success: true, data: { commentId: created.id } }
    } catch {
        return { success: false, error: "Erro ao adicionar comentário" }
    }
}

// Get occurrence attachments
export async function getOccurrenceAttachments(occurrenceId: number) {
    const session = await requireSession()
    const occurrence = await occurrenceService.getById(occurrenceId)

    if (!occurrence) return []

    if (session.user.role === 'manager') {
        await requireBuildingAccess(occurrence.buildingId)
    } else if (session.user.buildingId !== occurrence.buildingId) {
        throw new Error("Unauthorized")
    }

    const attachments = await occurrenceService.getOccurrenceAttachments(occurrenceId)

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
    const attachments = await occurrenceService.getCommentAttachments(commentId)

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
    const occurrence = await occurrenceService.getById(attachment.occurrenceId)
    if (!occurrence || occurrence.status === 'resolved') {
        return { success: false, error: "Ocorrência já está resolvida" }
    }

    try {
        await occurrenceService.deleteAttachment(attachmentId)
        revalidatePath(`/dashboard/occurrences/${attachment.occurrenceId}`)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao eliminar anexo" }
    }
}