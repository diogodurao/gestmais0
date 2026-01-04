import { db } from "@/db"
import { documents, user } from "@/db/schema"
import { eq, and, desc, isNull, or } from "drizzle-orm"
import { uploadToR2, deleteFromR2, getSignedDownloadUrl, generateFileKey } from "@/lib/r2"
import type {
    DocumentCategory,
    UploadDocumentInput,
    UploadNewVersionInput,
    Document
} from "@/lib/types"

export class DocumentService {
    // Get all documents for a building (latest versions only)
    async getByBuilding(buildingId: string, category?: DocumentCategory) {
        const conditions = [
            eq(documents.buildingId, buildingId),
            isNull(documents.originalId), // Only originals (we'll get latest version separately)
        ]

        if (category) {
            conditions.push(eq(documents.category, category))
        }

        // Get original documents
        const originals = await db
            .select({
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
            })
            .from(documents)
            .leftJoin(user, eq(documents.uploadedBy, user.id))
            .where(and(...conditions))
            .orderBy(desc(documents.uploadedAt))

        // For each original, find if there's a newer version
        const result = await Promise.all(
            originals.map(async (doc) => {
                const latestVersion = await this.getLatestVersion(doc.id)
                return latestVersion || doc
            })
        )

        return result
    }

    // Get latest version of a document
    async getLatestVersion(originalId: number) {
        const [latest] = await db
            .select({
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
            })
            .from(documents)
            .leftJoin(user, eq(documents.uploadedBy, user.id))
            .where(eq(documents.originalId, originalId))
            .orderBy(desc(documents.version))
            .limit(1)

        return latest || null
    }

    // Get all versions of a document
    async getVersionHistory(documentId: number) {
        // First, find the original document ID
        const doc = await this.getById(documentId)
        if (!doc) return []

        const originalId = doc.originalId || doc.id

        // Get original + all versions
        return await db
            .select({
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
            })
            .from(documents)
            .leftJoin(user, eq(documents.uploadedBy, user.id))
            .where(or(
                eq(documents.id, originalId),
                eq(documents.originalId, originalId)
            ))
            .orderBy(desc(documents.version))
    }

    // Get single document by ID
    async getById(id: number) {
        const [doc] = await db
            .select({
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
            })
            .from(documents)
            .leftJoin(user, eq(documents.uploadedBy, user.id))
            .where(eq(documents.id, id))
            .limit(1)

        return doc || null
    }

    // Upload new document
    async upload(input: UploadDocumentInput, userId: string) {
        const fileKey = generateFileKey(input.buildingId, input.file.originalName)
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

        return created
    }

    // Upload new version of existing document
    async uploadVersion(input: UploadNewVersionInput, userId: string) {
        const original = await this.getById(input.originalId)
        if (!original) throw new Error("Document not found")

        // Get the actual original ID (in case input.originalId is already a version)
        const actualOriginalId = original.originalId || original.id

        // Get current max version
        const versions = await this.getVersionHistory(actualOriginalId)
        const maxVersion = Math.max(...versions.map(v => v.version))

        const fileKey = generateFileKey(original.buildingId, input.file.originalName)
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

        return created
    }

    // Update document metadata
    async updateMetadata(id: number, data: { title?: string; description?: string }) {
        const [updated] = await db
            .update(documents)
            .set(data)
            .where(eq(documents.id, id))
            .returning()

        return updated
    }

    // Delete document (and all versions if it's an original)
    async delete(id: number) {
        const doc = await this.getById(id)
        if (!doc) return false

        // If this is an original, delete all versions too
        if (!doc.originalId) {
            const versions = await this.getVersionHistory(id)
            for (const version of versions) {
                await deleteFromR2(version.fileKey)
            }
            await db.delete(documents).where(or(
                eq(documents.id, id),
                eq(documents.originalId, id)
            ))
        } else {
            // Just delete this single version
            await deleteFromR2(doc.fileKey)
            await db.delete(documents).where(eq(documents.id, id))
        }

        return true
    }

    // Get signed download URL
    async getDownloadUrl(id: number): Promise<string | null> {
        const doc = await this.getById(id)
        if (!doc) return null

        // If fileUrl is already a public URL, return it
        if (doc.fileUrl.startsWith('http')) {
            return doc.fileUrl
        }

        // Otherwise, generate signed URL
        return await getSignedDownloadUrl(doc.fileKey)
    }
}

export const documentService = new DocumentService()