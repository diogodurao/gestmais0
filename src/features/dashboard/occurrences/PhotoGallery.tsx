"use client"

import { useState } from "react"
import { X, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { OccurrenceAttachment } from "@/lib/types"
import { deleteOccurrenceAttachment } from "@/app/actions/occurrences"
import { useToast } from "@/hooks/use-toast"

interface Props {
    attachments: OccurrenceAttachment[]
    canDelete?: boolean
    currentUserId?: string
}

export function PhotoGallery({ attachments, canDelete, currentUserId }: Props) {
    const { toast } = useToast()
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    if (attachments.length === 0) return null

    const handleDelete = async (attachmentId: number) => {
        if (!confirm("Eliminar esta foto?")) return

        setIsDeleting(true)
        const result = await deleteOccurrenceAttachment(attachmentId)

        if (result.success) {
            toast({ title: "Sucesso", description: "Foto eliminada" })
            setLightboxIndex(null)
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
        }
        setIsDeleting(false)
    }

    const showPrev = () => {
        if (lightboxIndex !== null && lightboxIndex > 0) {
            setLightboxIndex(lightboxIndex - 1)
        }
    }

    const showNext = () => {
        if (lightboxIndex !== null && lightboxIndex < attachments.length - 1) {
            setLightboxIndex(lightboxIndex + 1)
        }
    }

    return (
        <>
            {/* Thumbnails */}
            <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                    <button
                        key={attachment.id}
                        onClick={() => setLightboxIndex(index)}
                        className="w-20 h-20 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                    >
                        <img
                            src={attachment.fileUrl}
                            alt={attachment.fileName}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
                    {/* Close button */}
                    <button
                        onClick={() => setLightboxIndex(null)}
                        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Delete button */}
                    {canDelete && attachments[lightboxIndex].uploadedBy === currentUserId && (
                        <button
                            onClick={() => handleDelete(attachments[lightboxIndex].id)}
                            disabled={isDeleting}
                            className="absolute top-4 left-4 p-2 text-white hover:bg-white/10 rounded-lg"
                        >
                            <Trash2 className="w-6 h-6" />
                        </button>
                    )}

                    {/* Navigation */}
                    {attachments.length > 1 && (
                        <>
                            <button
                                onClick={showPrev}
                                disabled={lightboxIndex === 0}
                                className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-30"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                onClick={showNext}
                                disabled={lightboxIndex === attachments.length - 1}
                                className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-30"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </>
                    )}

                    {/* Image */}
                    <img
                        src={attachments[lightboxIndex].fileUrl}
                        alt={attachments[lightboxIndex].fileName}
                        className="max-w-[90vw] max-h-[90vh] object-contain"
                    />

                    {/* Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-body">
                        {lightboxIndex + 1} / {attachments.length}
                    </div>
                </div>
            )}
        </>
    )
}