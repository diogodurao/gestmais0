import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/auth-helpers"
import { occurrenceService } from "@/services/occurrence.service"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB for photos
const MAX_PHOTOS_PER_OCCURRENCE = 3
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
    try {
        const session = await requireSession()

        const formData = await request.formData()
        const occurrenceId = formData.get('occurrenceId') as string
        const commentId = formData.get('commentId') as string | null
        const files = formData.getAll('photos') as File[]

        if (!occurrenceId) {
            return NextResponse.json({ error: "occurrenceId é obrigatório" }, { status: 400 })
        }

        const occurrenceResult = await occurrenceService.getById(Number(occurrenceId))
        if (!occurrenceResult.success || !occurrenceResult.data) {
            return NextResponse.json({ error: "Ocorrência não encontrada" }, { status: 404 })
        }

        const occurrence = occurrenceResult.data

        // Verify building access
        if (session.user.role !== 'manager' && session.user.buildingId !== occurrence.buildingId) {
            return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
        }

        // Check if occurrence is still open
        if (occurrence.status === 'resolved') {
            return NextResponse.json({ error: "Ocorrência já está resolvida" }, { status: 400 })
        }

        // Check photo limit for occurrence (not comments)
        if (!commentId) {
            const countResult = await occurrenceService.countOccurrenceAttachments(Number(occurrenceId))
            if (!countResult.success) {
                return NextResponse.json({ error: countResult.error }, { status: 500 })
            }
            if (countResult.data + files.length > MAX_PHOTOS_PER_OCCURRENCE) {
                return NextResponse.json({
                    error: `Máximo ${MAX_PHOTOS_PER_OCCURRENCE} fotos por ocorrência`
                }, { status: 400 })
            }
        }

        const results = []

        for (const file of files) {
            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                results.push({
                    fileName: file.name,
                    success: false,
                    error: "Ficheiro muito grande (máx. 5 MB)",
                })
                continue
            }

            // Validate file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                results.push({
                    fileName: file.name,
                    success: false,
                    error: "Apenas fotos JPG, PNG ou WebP",
                })
                continue
            }

            try {
                const buffer = Buffer.from(await file.arrayBuffer())

                const attachmentResult = await occurrenceService.addAttachment(
                    Number(occurrenceId),
                    {
                        buffer,
                        originalName: file.name,
                        mimeType: file.type,
                        size: file.size,
                    },
                    session.user.id,
                    commentId ? Number(commentId) : undefined
                )

                if (!attachmentResult.success) {
                    results.push({
                        fileName: file.name,
                        success: false,
                        error: attachmentResult.error,
                    })
                    continue
                }

                results.push({ fileName: file.name, success: true, attachment: attachmentResult.data })
            } catch (error) {
                results.push({
                    fileName: file.name,
                    success: false,
                    error: "Erro ao carregar foto",
                })
            }
        }

        return NextResponse.json({ results })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: "Erro ao carregar fotos" },
            { status: 500 }
        )
    }
}