import { db } from "@/db"
import { documents, user } from "@/db/schema"
import { eq, and, desc, isNull, or, inArray, sql } from "drizzle-orm"
import { uploadToR2, deleteFromR2, getSignedDownloadUrl, generateFileKey } from "@/lib/r2"
import { ActionResult, Ok, Err, ErrorCodes } from "@/lib/types"
import { createLogger } from "@/lib/logger"

const logger = createLogger('DocumentService')
import type {
    DocumentCategory,
    UploadDocumentInput,
    UploadNewVersionInput,
} from "@/lib/types"

type DocumentRow = {
    id: number
    buildingId: string
    title: string
    description: string | null
    category: DocumentCategory
    fileName: string
    fileKey: string
    fileUrl: string
    fileSize: number
    fileType: string
    version: number
    originalId: number | null
    uploadedBy: string
    uploadedAt: Date
    uploaderName: string | null
}

export class DocumentService {
    // Shared select fields to avoid repetition
    private selectFields = {
        id: documents.id,
        buildingId: documents.buildingId,
        title: documents.title,
        description: documents.description,
        category: documents.category,
        fileName: documents.fileName,
        fileKey: documents.fileKey,
        fileUrl: documents.fileUrl,
        fileSize: documents.fileSize,
        fileType: documents.fileType,
        version: documents.version,
        originalId: documents.originalId,
        uploadedBy: documents.uploadedBy,
        uploadedAt: documents.uploadedAt,
        uploaderName: user.name,
    }

    /**
     * Get all documents for a building (latest versions only)
     * OPTIMIZED: Uses single query with subquery instead of N+1 pattern
     */
    async getByBuilding(buildingId: string, category?: DocumentCategory): Promise<ActionResult<DocumentRow[]>> {
        const conditions = [
            eq(documents.buildingId, buildingId),
            isNull(documents.originalId),
        ]

        if (category) {
            conditions.push(eq(documents.category, category))
        }

        // Step 1: Get all original document IDs
        const originals = await db
            .select(this.selectFields)
            .from(documents)
            .leftJoin(user, eq(documents.uploadedBy, user.id))
            .where(and(...conditions))
            .orderBy(desc(documents.uploadedAt))

        if (originals.length === 0) {
            return Ok([])
        }

        const originalIds = originals.map(o => o.id)

        // Step 2: Get all latest versions in ONE query using a subquery
        // This finds the max version for each originalId
        const latestVersions = await db
            .select(this.selectFields)
            .from(documents)
            .leftJoin(user, eq(documents.uploadedBy, user.id))
            .where(
                and(
                    inArray(documents.originalId, originalIds),
                    // Subquery to get only max version per original
                    sql`${documents.version} = (
                        SELECT MAX(d2.version)
                        FROM ${documents} d2
                        WHERE d2.original_id = ${documents.originalId}
                    )`
                )
            )

        // Step 3: Create a map of originalId -> latestVersion
        const versionMap = new Map<number, DocumentRow>()
        for (const version of latestVersions) {
            if (version.originalId) {
                versionMap.set(version.originalId, version)
            }
        }

        // Step 4: Return latest version if exists, otherwise original
        const result = originals.map(doc => versionMap.get(doc.id) || doc)

        return Ok(result)
    }

    // Get latest version of a document
    async getLatestVersion(originalId: number): Promise<ActionResult<DocumentRow | null>> {
        const [latest] = await db
            .select(this.selectFields)
            .from(documents)
            .leftJoin(user, eq(documents.uploadedBy, user.id))
            .where(eq(documents.originalId, originalId))
            .orderBy(desc(documents.version))
            .limit(1)

        return Ok(latest || null)
    }

    // Get all versions of a document
    async getVersionHistory(documentId: number): Promise<ActionResult<DocumentRow[]>> {
        const docResult = await this.getById(documentId)
        if (!docResult.success) return docResult
        if (!docResult.data) return Ok([])

        const doc = docResult.data
        const originalId = doc.originalId || doc.id

        const versions = await db
            .select(this.selectFields)
            .from(documents)
            .leftJoin(user, eq(documents.uploadedBy, user.id))
            .where(or(
                eq(documents.id, originalId),
                eq(documents.originalId, originalId)
            ))
            .orderBy(desc(documents.version))

        return Ok(versions)
    }

    // Get single document by ID
    async getById(id: number): Promise<ActionResult<DocumentRow | null>> {
        const [doc] = await db
            .select(this.selectFields)
            .from(documents)
            .leftJoin(user, eq(documents.uploadedBy, user.id))
            .where(eq(documents.id, id))
            .limit(1)

        return Ok(doc || null)
    }

    // Upload new document
    async upload(input: UploadDocumentInput, userId: string): Promise<ActionResult<typeof documents.$inferSelect>> {
        const fileKey = generateFileKey(input.buildingId, input.file.originalName)

        try {
            const fileUrl = await uploadToR2(input.file.buffer, fileKey, input.file.mimeType)

            const [created] = await db
                .insert(documents)
                .values({
                    buildingId: input.buildingId,
                    title: input.title,
                    description: input.description || null,
                    category: input.category,
                    fileName: input.file.originalName,
                    fileKey,
                    fileUrl,
                    fileSize: input.file.size,
                    fileType: input.file.mimeType,
                    version: 1,
                    uploadedBy: userId,
                })
                .returning()

            return Ok(created)
        } catch (error) {
            logger.error("Failed to upload document", { method: 'upload', buildingId: input.buildingId }, error)
            return Err("Erro ao carregar documento", ErrorCodes.INTERNAL_ERROR)
        }
    }

    // Upload new version of existing document
    async uploadVersion(input: UploadNewVersionInput, userId: string): Promise<ActionResult<typeof documents.$inferSelect>> {
        const originalResult = await this.getById(input.originalId)
        if (!originalResult.success) return originalResult
        if (!originalResult.data) {
            return Err("Documento não encontrado", ErrorCodes.DOCUMENT_NOT_FOUND)
        }

        const original = originalResult.data
        const actualOriginalId = original.originalId || original.id

        // Get current max version
        const versionsResult = await this.getVersionHistory(actualOriginalId)
        if (!versionsResult.success) return versionsResult

        const versions = versionsResult.data
        const maxVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version)) : 0

        const fileKey = generateFileKey(original.buildingId, input.file.originalName)

        try {
            const fileUrl = await uploadToR2(input.file.buffer, fileKey, input.file.mimeType)

            const [created] = await db
                .insert(documents)
                .values({
                    buildingId: original.buildingId,
                    title: original.title,
                    description: original.description,
                    category: original.category,
                    fileName: input.file.originalName,
                    fileKey,
                    fileUrl,
                    fileSize: input.file.size,
                    fileType: input.file.mimeType,
                    version: maxVersion + 1,
                    originalId: actualOriginalId,
                    uploadedBy: userId,
                })
                .returning()

            return Ok(created)
        } catch (error) {
            logger.error("Failed to upload new version", { method: 'uploadVersion', originalId: input.originalId }, error)
            return Err("Erro ao carregar nova versão", ErrorCodes.INTERNAL_ERROR)
        }
    }

    // Update document metadata
    async updateMetadata(id: number, data: { title?: string; description?: string }): Promise<ActionResult<typeof documents.$inferSelect>> {
        const existing = await db.select().from(documents).where(eq(documents.id, id)).limit(1)
        if (!existing.length) {
            return Err("Documento não encontrado", ErrorCodes.DOCUMENT_NOT_FOUND)
        }

        const [updated] = await db
            .update(documents)
            .set(data)
            .where(eq(documents.id, id))
            .returning()

        return Ok(updated)
    }

    // Delete document (and all versions if it's an original)
    async delete(id: number): Promise<ActionResult<boolean>> {
        const docResult = await this.getById(id)
        if (!docResult.success) return docResult
        if (!docResult.data) {
            return Err("Documento não encontrado", ErrorCodes.DOCUMENT_NOT_FOUND)
        }

        const doc = docResult.data

        try {
            // Use transaction for consistency
            await db.transaction(async (tx) => {
                if (!doc.originalId) {
                    // This is an original - delete all versions
                    const versionsResult = await this.getVersionHistory(id)
                    if (versionsResult.success) {
                        for (const version of versionsResult.data) {
                            await deleteFromR2(version.fileKey)
                        }
                    }
                    await tx.delete(documents).where(or(
                        eq(documents.id, id),
                        eq(documents.originalId, id)
                    ))
                } else {
                    // Just delete this single version
                    await deleteFromR2(doc.fileKey)
                    await tx.delete(documents).where(eq(documents.id, id))
                }
            })

            return Ok(true)
        } catch (error) {
            logger.error("Failed to delete document", { method: 'delete', documentId: id }, error)
            return Err("Erro ao eliminar documento", ErrorCodes.INTERNAL_ERROR)
        }
    }

    // Get signed download URL
    async getDownloadUrl(id: number): Promise<ActionResult<string>> {
        const docResult = await this.getById(id)
        if (!docResult.success) return docResult
        if (!docResult.data) {
            return Err("Documento não encontrado", ErrorCodes.DOCUMENT_NOT_FOUND)
        }

        const doc = docResult.data

        // If fileUrl is already a public URL, return it
        if (doc.fileUrl.startsWith('http')) {
            return Ok(doc.fileUrl)
        }

        // Otherwise, generate signed URL
        try {
            const url = await getSignedDownloadUrl(doc.fileKey)
            return Ok(url)
        } catch (error) {
            logger.error("Failed to generate download URL", { method: 'getDownloadUrl', documentId: id }, error)
            return Err("Erro ao gerar URL de download", ErrorCodes.INTERNAL_ERROR)
        }
    }
}

export const documentService = new DocumentService()