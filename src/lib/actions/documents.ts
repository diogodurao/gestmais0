"use server"

import { updateTag } from "next/cache"
import { requireSession, requireBuildingAccess } from "@/lib/auth-helpers"
import { documentService } from "@/services/document.service"
import { ActionResult, DocumentCategory, Document } from "@/lib/types"

// Get all documents for building
export async function getDocuments(buildingId: string, category?: DocumentCategory) {
    const session = await requireSession()

    if (session.user.role === 'manager') {
        await requireBuildingAccess(buildingId)
    } else if (session.user.buildingId !== buildingId) {
        throw new Error("Unauthorized")
    }

    return await documentService.getByBuilding(buildingId, category) as Document[]
}

// Get version history
export async function getDocumentVersions(documentId: number) {
    const session = await requireSession()
    const doc = await documentService.getById(documentId)

    if (!doc) return []

    if (session.user.role === 'manager') {
        await requireBuildingAccess(doc.buildingId)
    } else if (session.user.buildingId !== doc.buildingId) {
        throw new Error("Unauthorized")
    }

    return await documentService.getVersionHistory(documentId) as Document[]
}

// Get download URL
export async function getDocumentDownloadUrl(documentId: number) {
    const session = await requireSession()
    const doc = await documentService.getById(documentId)

    if (!doc) return null

    if (session.user.role === 'manager') {
        await requireBuildingAccess(doc.buildingId)
    } else if (session.user.buildingId !== doc.buildingId) {
        throw new Error("Unauthorized")
    }

    return await documentService.getDownloadUrl(documentId)
}

// Update metadata (manager only)
export async function updateDocumentMetadata(
    documentId: number,
    data: { title?: string; description?: string }
): Promise<ActionResult<void>> {
    const { session } = await requireBuildingAccess(
        (await documentService.getById(documentId))?.buildingId || ""
    )

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem editar documentos" }
    }

    try {
        const doc = await documentService.getById(documentId)
        await documentService.updateMetadata(documentId, data)
        if (doc) {
            updateTag(`documents-${doc.buildingId}`)
            updateTag(`document-${documentId}`)
        }
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao atualizar documento" }
    }
}

// Delete document (manager only)
export async function deleteDocument(documentId: number): Promise<ActionResult<void>> {
    const doc = await documentService.getById(documentId)
    if (!doc) {
        return { success: false, error: "Documento não encontrado" }
    }

    const { session } = await requireBuildingAccess(doc.buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem eliminar documentos" }
    }

    try {
        await documentService.delete(documentId)
        updateTag(`documents-${doc.buildingId}`)
        return { success: true, data: undefined }
    } catch {
        return { success: false, error: "Erro ao eliminar documento" }
    }
}