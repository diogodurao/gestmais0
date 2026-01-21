import { db } from "@/db"
import { occurrences, occurrenceComments, occurrenceAttachments, user } from "@/db/schema"
import { eq, and, desc, sql, isNull, count } from "drizzle-orm"
import { OccurrenceStatus, OccurrencePriority, CreateOccurrenceInput, UpdateOccurrenceInput, ActionResult, Ok, Err, ErrorCodes } from "@/lib/types"
import { uploadToR2, deleteFromR2 } from "@/lib/r2"
import { createLogger } from "@/lib/logger"

const logger = createLogger('OccurrenceService')

type OccurrenceRow = {
    id: number
    buildingId: string
    title: string
    type: string
    description: string | null
    status: OccurrenceStatus
    priority: OccurrencePriority
    createdBy: string
    createdAt: Date
    resolvedAt: Date | null
    creatorName: string | null
    commentCount?: number
}

type CommentRow = {
    id: number
    occurrenceId: number
    content: string
    createdBy: string
    createdAt: Date
    creatorName: string | null
}

export class OccurrenceService {
    async getByBuilding(buildingId: string, status?: OccurrenceStatus): Promise<ActionResult<OccurrenceRow[]>> {
        const conditions = [eq(occurrences.buildingId, buildingId)]
        if (status) {
            conditions.push(eq(occurrences.status, status))
        }

        const results = await db
            .select({
                id: occurrences.id,
                buildingId: occurrences.buildingId,
                title: occurrences.title,
                type: occurrences.type,
                description: occurrences.description,
                status: occurrences.status,
                priority: occurrences.priority,
                createdBy: occurrences.createdBy,
                createdAt: occurrences.createdAt,
                resolvedAt: occurrences.resolvedAt,
                creatorName: user.name,
                commentCount: sql<number>`(
                    SELECT COUNT(*) FROM occurrence_comments
                    WHERE occurrence_id = ${occurrences.id}
                )`.as('comment_count'),
            })
            .from(occurrences)
            .leftJoin(user, eq(occurrences.createdBy, user.id))
            .where(and(...conditions))
            .orderBy(desc(occurrences.createdAt))

        return Ok(results)
    }

    async getById(id: number): Promise<ActionResult<OccurrenceRow | null>> {
        const [result] = await db
            .select({
                id: occurrences.id,
                buildingId: occurrences.buildingId,
                title: occurrences.title,
                type: occurrences.type,
                description: occurrences.description,
                status: occurrences.status,
                priority: occurrences.priority,
                createdBy: occurrences.createdBy,
                createdAt: occurrences.createdAt,
                resolvedAt: occurrences.resolvedAt,
                creatorName: user.name,
            })
            .from(occurrences)
            .leftJoin(user, eq(occurrences.createdBy, user.id))
            .where(eq(occurrences.id, id))
            .limit(1)

        return Ok(result || null)
    }

    async create(input: CreateOccurrenceInput, userId: string): Promise<ActionResult<typeof occurrences.$inferSelect>> {
        const [created] = await db
            .insert(occurrences)
            .values({
                buildingId: input.buildingId,
                title: input.title,
                type: input.type,
                priority: input.priority || 'medium',
                description: input.description || null,
                createdBy: userId,
            })
            .returning()

        return Ok(created)
    }

    async update(id: number, data: UpdateOccurrenceInput): Promise<ActionResult<typeof occurrences.$inferSelect>> {
        const existing = await db.select().from(occurrences).where(eq(occurrences.id, id)).limit(1)
        if (!existing.length) {
            return Err("Ocorrência não encontrada", ErrorCodes.OCCURRENCE_NOT_FOUND)
        }

        const [updated] = await db
            .update(occurrences)
            .set(data)
            .where(eq(occurrences.id, id))
            .returning()

        return Ok(updated)
    }

    async updateStatus(id: number, status: OccurrenceStatus): Promise<ActionResult<typeof occurrences.$inferSelect>> {
        const existing = await db.select().from(occurrences).where(eq(occurrences.id, id)).limit(1)
        if (!existing.length) {
            return Err("Ocorrência não encontrada", ErrorCodes.OCCURRENCE_NOT_FOUND)
        }

        // Use transaction for consistency
        const result = await db.transaction(async (tx) => {
            const updateData: Partial<typeof occurrences.$inferInsert> = { status }

            if (status === "resolved") {
                updateData.resolvedAt = new Date()
                // Delete all attachments from R2
                await this.deleteAllAttachments(id)
            }

            const [updated] = await tx
                .update(occurrences)
                .set(updateData)
                .where(eq(occurrences.id, id))
                .returning()

            return updated
        })

        return Ok(result)
    }

    async delete(id: number): Promise<ActionResult<boolean>> {
        const existing = await db.select().from(occurrences).where(eq(occurrences.id, id)).limit(1)
        if (!existing.length) {
            return Err("Ocorrência não encontrada", ErrorCodes.OCCURRENCE_NOT_FOUND)
        }

        // Delete R2 attachments first (DB cascade will handle DB records)
        const attachmentsCleanup = await this.deleteAllAttachments(id)
        if (!attachmentsCleanup.success) {
            logger.warn("Failed to clean up attachments before deleting occurrence", { method: 'delete', occurrenceId: id })
            // Continue with deletion anyway - orphaned R2 files are acceptable
        }

        await db.delete(occurrences).where(eq(occurrences.id, id))
        return Ok(true)
    }

    // Comments
    async getComments(occurrenceId: number): Promise<ActionResult<CommentRow[]>> {
        const results = await db
            .select({
                id: occurrenceComments.id,
                occurrenceId: occurrenceComments.occurrenceId,
                content: occurrenceComments.content,
                createdBy: occurrenceComments.createdBy,
                createdAt: occurrenceComments.createdAt,
                creatorName: user.name,
            })
            .from(occurrenceComments)
            .leftJoin(user, eq(occurrenceComments.createdBy, user.id))
            .where(eq(occurrenceComments.occurrenceId, occurrenceId))
            .orderBy(occurrenceComments.createdAt)

        return Ok(results)
    }

    async addComment(occurrenceId: number, content: string, userId: string): Promise<ActionResult<typeof occurrenceComments.$inferSelect>> {
        const [created] = await db
            .insert(occurrenceComments)
            .values({
                occurrenceId,
                content,
                createdBy: userId,
            })
            .returning()

        return Ok(created)
    }

    // --- Attachments ---

    async getAttachments(occurrenceId: number): Promise<ActionResult<(typeof occurrenceAttachments.$inferSelect)[]>> {
        const results = await db
            .select()
            .from(occurrenceAttachments)
            .where(eq(occurrenceAttachments.occurrenceId, occurrenceId))
            .orderBy(occurrenceAttachments.uploadedAt)

        return Ok(results)
    }

    async getOccurrenceAttachments(occurrenceId: number): Promise<ActionResult<(typeof occurrenceAttachments.$inferSelect)[]>> {
        const results = await db
            .select()
            .from(occurrenceAttachments)
            .where(and(
                eq(occurrenceAttachments.occurrenceId, occurrenceId),
                isNull(occurrenceAttachments.commentId)
            ))
            .orderBy(occurrenceAttachments.uploadedAt)

        return Ok(results)
    }

    async getCommentAttachments(commentId: number): Promise<ActionResult<(typeof occurrenceAttachments.$inferSelect)[]>> {
        const results = await db
            .select()
            .from(occurrenceAttachments)
            .where(eq(occurrenceAttachments.commentId, commentId))
            .orderBy(occurrenceAttachments.uploadedAt)

        return Ok(results)
    }

    async countOccurrenceAttachments(occurrenceId: number): Promise<ActionResult<number>> {
        const [result] = await db
            .select({ count: count() })
            .from(occurrenceAttachments)
            .where(and(
                eq(occurrenceAttachments.occurrenceId, occurrenceId),
                isNull(occurrenceAttachments.commentId)
            ))

        return Ok(result.count)
    }

    async addAttachment(
        occurrenceId: number,
        file: { buffer: Buffer; originalName: string; mimeType: string; size: number },
        userId: string,
        commentId?: number
    ): Promise<ActionResult<typeof occurrenceAttachments.$inferSelect>> {
        const fileKey = `buildings/occurrences/${occurrenceId}/${Date.now()}-${file.originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`

        try {
            const fileUrl = await uploadToR2(file.buffer, fileKey, file.mimeType)

            const [created] = await db
                .insert(occurrenceAttachments)
                .values({
                    occurrenceId,
                    commentId: commentId || null,
                    fileName: file.originalName,
                    fileKey,
                    fileUrl,
                    fileSize: file.size,
                    fileType: file.mimeType,
                    uploadedBy: userId,
                })
                .returning()

            return Ok(created)
        } catch (error) {
            logger.error("Failed to upload attachment", { method: 'addAttachment', occurrenceId }, error)
            return Err("Erro ao carregar anexo", ErrorCodes.INTERNAL_ERROR)
        }
    }

    async deleteAttachment(attachmentId: number): Promise<ActionResult<boolean>> {
        const [attachment] = await db
            .select()
            .from(occurrenceAttachments)
            .where(eq(occurrenceAttachments.id, attachmentId))
            .limit(1)

        if (!attachment) {
            return Err("Anexo não encontrado", ErrorCodes.NOT_FOUND)
        }

        try {
            await deleteFromR2(attachment.fileKey)
            await db.delete(occurrenceAttachments).where(eq(occurrenceAttachments.id, attachmentId))
            return Ok(true)
        } catch (error) {
            logger.error("Failed to delete attachment", { method: 'deleteAttachment', attachmentId }, error)
            return Err("Erro ao eliminar anexo", ErrorCodes.INTERNAL_ERROR)
        }
    }

    async deleteAllAttachments(occurrenceId: number): Promise<ActionResult<boolean>> {
        const attachmentsResult = await this.getAttachments(occurrenceId)
        if (!attachmentsResult.success) return attachmentsResult

        try {
            for (const attachment of attachmentsResult.data) {
                await deleteFromR2(attachment.fileKey)
            }

            await db.delete(occurrenceAttachments).where(eq(occurrenceAttachments.occurrenceId, occurrenceId))
            return Ok(true)
        } catch (error) {
            logger.error("Failed to delete all attachments", { method: 'deleteAllAttachments', occurrenceId }, error)
            return Err("Erro ao eliminar anexos", ErrorCodes.INTERNAL_ERROR)
        }
    }
}

export const occurrenceService = new OccurrenceService()
