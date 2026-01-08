import { NextRequest, NextResponse } from "next/server"
import { requireSession, requireBuildingAccess } from "@/lib/session"
import { documentService } from "@/services/document.service"
import { DocumentCategory } from "@/lib/types"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/jpeg',
    'image/png',
    'text/plain',
]

export async function POST(request: NextRequest) {
    try {
        const session = await requireSession()

        if (session.user.role !== 'manager') {
            return NextResponse.json(
                { error: "Apenas gestores podem carregar documentos" },
                { status: 403 }
            )
        }

        const formData = await request.formData()
        const buildingId = formData.get('buildingId') as string
        const title = formData.get('title') as string
        const description = formData.get('description') as string | null
        const category = formData.get('category') as DocumentCategory
        const originalId = formData.get('originalId') as string | null // For new versions
        const files = formData.getAll('files') as File[]

        if (!buildingId) {
            return NextResponse.json({ error: "buildingId é obrigatório" }, { status: 400 })
        }

        await requireBuildingAccess(buildingId)

        if (files.length === 0) {
            return NextResponse.json({ error: "Nenhum ficheiro selecionado" }, { status: 400 })
        }

        const results = []

        for (const file of files) {
            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                results.push({
                    fileName: file.name,
                    success: false,
                    error: "Ficheiro muito grande (máx. 10 MB)",
                })
                continue
            }

            // Validate file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                results.push({
                    fileName: file.name,
                    success: false,
                    error: "Tipo de ficheiro não permitido",
                })
                continue
            }

            try {
                const buffer = Buffer.from(await file.arrayBuffer())

                if (originalId) {
                    // Upload as new version
                    const doc = await documentService.uploadVersion(
                        {
                            originalId: parseInt(originalId),
                            file: {
                                buffer,
                                originalName: file.name,
                                mimeType: file.type,
                                size: file.size,
                            },
                        },
                        session.user.id
                    )
                    results.push({ fileName: file.name, success: true, document: doc })
                } else {
                    // Upload as new document
                    const doc = await documentService.upload(
                        {
                            buildingId,
                            title: title || file.name,
                            description: description || undefined,
                            category,
                            file: {
                                buffer,
                                originalName: file.name,
                                mimeType: file.type,
                                size: file.size,
                            },
                        },
                        session.user.id
                    )
                    results.push({ fileName: file.name, success: true, document: doc })
                }
            } catch (error) {
                results.push({
                    fileName: file.name,
                    success: false,
                    error: "Erro ao carregar ficheiro",
                })
            }
        }

        return NextResponse.json({ results })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: "Erro ao carregar documentos" },
            { status: 500 }
        )
    }
}