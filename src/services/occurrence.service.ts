import { db } from "@/db"
import { occurrences, occurrenceComments, occurrenceAttachments, user } from "@/db/schema"
import { eq, and, desc, sql, isNull, count } from "drizzle-orm"
import { OccurrenceStatus, CreateOccurrenceInput, UpdateOccurrenceInput } from "@/lib/types"
import { uploadToR2, deleteFromR2 } from "@/lib/r2"

export class OccurrenceService {
    async getByBuilding(buildingId: string, status?: OccurrenceStatus) {
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

        return results
    }

    async getById(id: number) {
        const [result] = await db
            .select({
                id: occurrences.id,
                buildingId: occurrences.buildingId,
                title: occurrences.title,
                type: occurrences.type,
                description: occurrences.description,
                status: occurrences.status,
                createdBy: occurrences.createdBy,
                createdAt: occurrences.createdAt,
                resolvedAt: occurrences.resolvedAt,
                creatorName: user.name,
            })
            .from(occurrences)
            .leftJoin(user, eq(occurrences.createdBy, user.id))
            .where(eq(occurrences.id, id))
            .limit(1)

        return result || null
    }

    async create(input: CreateOccurrenceInput, userId: string) {
        const [created] = await db
            .insert(occurrences)
            .values({
                buildingId: input.buildingId,
                title: input.title,
                type: input.type,
                description: input.description || null,
                createdBy: userId,
            })
            .returning()

        return created
    }

    async update(id: number, data: UpdateOccurrenceInput) {
        const [updated] = await db
            .update(occurrences)
            .set(data)
            .where(eq(occurrences.id, id))
            .returning()

        return updated
    }

    // Update existing updateStatus method to cleanup attachments on resolve
    async updateStatus(id: number, status: OccurrenceStatus) {
        const updateData: Partial<typeof occurrences.$inferInsert> = { status }

        if (status === "resolved") {
            updateData.resolvedAt = new Date()
            // Delete all attachments from R2
            await this.deleteAllAttachments(id)
        }

        const [updated] = await db
            .update(occurrences)
            .set(updateData)
            .where(eq(occurrences.id, id))
            .returning()

        return updated
    }

    async delete(id: number) {
        await db.delete(occurrences).where(eq(occurrences.id, id))
        return true
    }

    // Comments
    async getComments(occurrenceId: number) {
        return await db
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
    }

    async addComment(occurrenceId: number, content: string, userId: string) {
        const [created] = await db
            .insert(occurrenceComments)
            .values({
                occurrenceId,
                content,
                createdBy: userId,
            })
            .returning()

        return created
    }

    // --- Attachments ---

    async getAttachments(occurrenceId: number) {
        return await db
            .select()
            .from(occurrenceAttachments)
            .where(eq(occurrenceAttachments.occurrenceId, occurrenceId))
            .orderBy(occurrenceAttachments.uploadedAt)
    }

    async getOccurrenceAttachments(occurrenceId: number) {
        // Get attachments directly on occurrence (not on comments)
        return await db
            .select()
            .from(occurrenceAttachments)
            .where(and(
                eq(occurrenceAttachments.occurrenceId, occurrenceId),
                isNull(occurrenceAttachments.commentId)
            ))
            .orderBy(occurrenceAttachments.uploadedAt)
    }

    async getCommentAttachments(commentId: number) {
        return await db
            .select()
            .from(occurrenceAttachments)
            .where(eq(occurrenceAttachments.commentId, commentId))
            .orderBy(occurrenceAttachments.uploadedAt)
    }

    async countOccurrenceAttachments(occurrenceId: number): Promise<number> {
        const [result] = await db
            .select({ count: count() })
            .from(occurrenceAttachments)
            .where(and(
                eq(occurrenceAttachments.occurrenceId, occurrenceId),
                isNull(occurrenceAttachments.commentId)
            ))

        return result.count
    }

    async addAttachment(
        occurrenceId: number,
        file: { buffer: Buffer; originalName: string; mimeType: string; size: number },
        userId: string,
        commentId?: number
    ) {
        const fileKey = `buildings/occurrences/${occurrenceId}/${Date.now()}-${file.originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
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

        return created
    }

    async deleteAttachment(attachmentId: number) {
        const [attachment] = await db
            .select()
            .from(occurrenceAttachments)
            .where(eq(occurrenceAttachments.id, attachmentId))
            .limit(1)

        if (attachment) {
            await deleteFromR2(attachment.fileKey)
            await db.delete(occurrenceAttachments).where(eq(occurrenceAttachments.id, attachmentId))
        }

        return true
    }

    // Delete all attachments for an occurrence (call when resolving)
    async deleteAllAttachments(occurrenceId: number) {
        const attachments = await this.getAttachments(occurrenceId)

        for (const attachment of attachments) {
            await deleteFromR2(attachment.fileKey)
        }

        await db.delete(occurrenceAttachments).where(eq(occurrenceAttachments.occurrenceId, occurrenceId))

        return true
    }
}

export const occurrenceService = new OccurrenceService()