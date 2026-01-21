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

    const result = await documentService.getByBuilding(buildingId, category)
    if (!result.success) throw new Error(result.error)
    return result.data as Document[]
}

// Get version history
export async function getDocumentVersions(documentId: number) {
    const session = await requireSession()
    const docResult = await documentService.getById(documentId)

    if (!docResult.success) return []
    if (!docResult.data) return []

    const doc = docResult.data

    if (session.user.role === 'manager') {
        await requireBuildingAccess(doc.buildingId)
    } else if (session.user.buildingId !== doc.buildingId) {
        throw new Error("Unauthorized")
    }

    const result = await documentService.getVersionHistory(documentId)
    if (!result.success) return []
    return result.data as Document[]
}

// Get download URL
export async function getDocumentDownloadUrl(documentId: number) {
    const session = await requireSession()
    const docResult = await documentService.getById(documentId)

    if (!docResult.success || !docResult.data) return null

    const doc = docResult.data

    if (session.user.role === 'manager') {
        await requireBuildingAccess(doc.buildingId)
    } else if (session.user.buildingId !== doc.buildingId) {
        throw new Error("Unauthorized")
    }

    const result = await documentService.getDownloadUrl(documentId)
    if (!result.success) return null
    return result.data
}

// Update metadata (manager only)
export async function updateDocumentMetadata(
    documentId: number,
    data: { title?: string; description?: string }
): Promise<ActionResult<void>> {
    const docResult = await documentService.getById(documentId)
    if (!docResult.success || !docResult.data) {
        return { success: false, error: "Documento não encontrado" }
    }

    const doc = docResult.data
    const { session } = await requireBuildingAccess(doc.buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem editar documentos" }
    }

    const result = await documentService.updateMetadata(documentId, data)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`documents-${doc.buildingId}`)
    updateTag(`document-${documentId}`)
    return { success: true, data: undefined }
}

// Delete document (manager only)
export async function deleteDocument(documentId: number): Promise<ActionResult<void>> {
    const docResult = await documentService.getById(documentId)
    if (!docResult.success || !docResult.data) {
        return { success: false, error: "Documento não encontrado" }
    }

    const doc = docResult.data
    const { session } = await requireBuildingAccess(doc.buildingId)

    if (session.user.role !== 'manager') {
        return { success: false, error: "Apenas gestores podem eliminar documentos" }
    }

    const result = await documentService.delete(documentId)
    if (!result.success) return { success: false, error: result.error }

    updateTag(`documents-${doc.buildingId}`)
    return { success: true, data: undefined }
}