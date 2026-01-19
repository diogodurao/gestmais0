"use client"

import { useState, useOptimistic, useTransition, useRef } from "react"
import Image from "next/image"
import { Camera, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { PhotoGallery } from "./PhotoGallery"
import { addOccurrenceComment } from "@/lib/actions/occurrences"
import { OccurrenceComment, OccurrenceAttachment } from "@/lib/types"
import { useToast } from "@/components/ui/Toast"
import { formatDistanceToNow } from "@/lib/format"

interface Props {
    occurrenceId: number
    comments: (OccurrenceComment & { attachments?: OccurrenceAttachment[] })[]
    currentUserId: string
    currentUserName: string
    isManager: boolean
    isClosed: boolean
}

export function CommentSection({
    occurrenceId,
    comments,
    currentUserId,
    currentUserName,
    isManager,
    isClosed,
}: Props) {
    const { addToast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [content, setContent] = useState("")
    const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null)
    const [isPending, startTransition] = useTransition()

    const handlePhotoSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return

        const file = files[0]
        if (file.type.startsWith('image/')) {
            if (photo) {
                URL.revokeObjectURL(photo.preview)
            }
            setPhoto({
                file,
                preview: URL.createObjectURL(file),
            })
        }
    }

    const removePhoto = () => {
        if (photo) {
            URL.revokeObjectURL(photo.preview)
            setPhoto(null)
        }
    }

    const handleSubmit = () => {
        if (!content.trim() && !photo) return
        if (isClosed) return

        startTransition(async () => {
            // First create comment
            const result = await addOccurrenceComment(occurrenceId, content.trim() || "(foto anexada)")

            if (result.success && result.data?.commentId && photo) {
                // Upload photo
                const formData = new FormData()
                formData.append('occurrenceId', occurrenceId.toString())
                formData.append('commentId', result.data.commentId.toString())
                formData.append('photos', photo.file)

                try {
                    await fetch('/api/occurrences/upload', {
                        method: 'POST',
                        body: formData,
                    })
                } catch (error) {
                    console.error('Photo upload error:', error)
                }
            }

            if (result.success) {
                setContent("")
                removePhoto()
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
        })
    }

    return (
        <div className="space-y-4">
            <h3 className="text-body font-bold text-slate-700">
                Comentários ({comments.length})
            </h3>

            {comments.length === 0 ? (
                <p className="text-body text-slate-500 py-4">
                    Ainda não há comentários.
                </p>
            ) : (
                <div className="space-y-3">
                    {comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-body font-medium text-slate-700">
                                    {comment.creatorName}
                                </span>
                                <span className="text-label text-slate-400">
                                    {formatDistanceToNow(comment.createdAt)}
                                </span>
                            </div>
                            <p className="text-body text-slate-600 whitespace-pre-wrap">
                                {comment.content}
                            </p>

                            {/* Comment attachments */}
                            {comment.attachments && comment.attachments.length > 0 && (
                                <div className="mt-2">
                                    <PhotoGallery
                                        attachments={comment.attachments}
                                        canDelete={!isClosed}
                                        currentUserId={currentUserId}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!isClosed ? (
                <div className="pt-2 border-t border-slate-200">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escreva um comentário..."
                        rows={3}
                    />

                    {/* Photo preview */}
                    {photo && (
                        <div className="relative w-20 h-20 mt-2">
                            <Image
                                src={photo.preview}
                                alt="Preview"
                                fill
                                sizes="80px"
                                className="object-cover rounded-lg"
                                unoptimized
                            />
                            <button
                                onClick={removePhoto}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1 text-body text-slate-500 hover:text-slate-700"
                        >
                            <Camera className="w-4 h-4" />
                            <span>Adicionar foto</span>
                        </button>
                        <Button
                            onClick={handleSubmit}
                            disabled={(!content.trim() && !photo) || isPending}
                            size="sm"
                        >
                            Comentar
                        </Button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handlePhotoSelect(e.target.files)}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="pt-2 border-t border-slate-200">
                    <p className="text-body text-slate-500 text-center py-2">
                        Esta ocorrência está resolvida. Não é possível adicionar comentários.
                    </p>
                </div>
            )}
        </div>
    )
}