"use client"

import { useState, useOptimistic, useTransition, useRef } from "react"
import { Edit, Trash2, MoreVertical, Camera, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { PhotoGallery } from "@/components/dashboard/occurrences/PhotoGallery"
import { useToast } from "@/components/ui/Toast"
import { formatDistanceToNow } from "@/lib/format"
import { OccurrenceAttachment } from "@/lib/types"

// Generic comment type
interface BaseComment {
    id: number
    content: string
    isEdited?: boolean
    createdBy: string
    createdAt: Date
    updatedAt?: Date
    creatorName: string | null
}

interface CommentWithAttachments extends BaseComment {
    attachments?: OccurrenceAttachment[]
}

interface CommentSectionProps<T extends BaseComment> {
    entityId: number
    entityType: "discussion" | "occurrence"
    comments: T[]
    currentUserId: string
    currentUserName: string
    isManager: boolean
    isClosed: boolean
    closedMessage?: string
    actions: {
        add: (entityId: number, content: string) => Promise<{ success: boolean; error?: string; data?: any }>
        update?: (commentId: number, content: string) => Promise<{ success: boolean; error?: string }>
        delete?: (commentId: number) => Promise<{ success: boolean; error?: string }>
    }
    features?: {
        allowEdit?: boolean
        allowDelete?: boolean
        allowAttachments?: boolean
        uploadEndpoint?: string
    }
}

export function CommentSection<T extends BaseComment>({
    entityId,
    entityType,
    comments,
    currentUserId,
    currentUserName,
    isManager,
    isClosed,
    closedMessage,
    actions,
    features = {}
}: CommentSectionProps<T>) {
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [content, setContent] = useState("")
    const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null)
    const [isPending, startTransition] = useTransition()
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editContent, setEditContent] = useState("")
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null)

    const {
        allowEdit = entityType === "discussion",
        allowDelete = true,
        allowAttachments = entityType === "occurrence",
        uploadEndpoint = "/api/occurrences/upload"
    } = features

    // Optimistic comments with support for add/update/delete
    type OptimisticAction =
        | { type: 'add'; comment: T }
        | { type: 'update'; commentId: number; content: string }
        | { type: 'delete'; commentId: number }

    const [optimisticComments, updateOptimisticComments] = useOptimistic(
        comments,
        (state: T[], action: OptimisticAction) => {
            switch (action.type) {
                case 'add':
                    return [...state, action.comment]
                case 'update':
                    return state.map(c =>
                        c.id === action.commentId
                            ? { ...c, content: action.content, isEdited: true } as T
                            : c
                    )
                case 'delete':
                    return state.filter(c => c.id !== action.commentId)
                default:
                    return state
            }
        }
    )

    const handlePhotoSelect = (files: FileList | null) => {
        if (!allowAttachments || !files || files.length === 0) return

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

        const shouldUseOptimistic = entityType === "discussion"

        if (shouldUseOptimistic) {
            const optimisticComment = {
                id: Date.now(),
                [`${entityType}Id`]: entityId,
                content: content.trim(),
                isEdited: false,
                createdBy: currentUserId,
                createdAt: new Date(),
                updatedAt: new Date(),
                creatorName: currentUserName,
            } as unknown as T

            startTransition(async () => {
                updateOptimisticComments({ type: 'add', comment: optimisticComment })
                setContent("")

                const result = await actions.add(entityId, content.trim())
                if (!result.success) {
                    toast({ title: "Erro", description: result.error, variant: "destructive" })
                }
            })
        } else {
            // Occurrence with possible photo upload
            startTransition(async () => {
                const result = await actions.add(entityId, content.trim() || "(foto anexada)")

                if (result.success && result.data?.commentId && photo) {
                    const formData = new FormData()
                    formData.append(`${entityType}Id`, entityId.toString())
                    formData.append('commentId', result.data.commentId.toString())
                    formData.append('photos', photo.file)

                    try {
                        await fetch(uploadEndpoint, {
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
                    toast({ title: "Erro", description: result.error, variant: "destructive" })
                }
            })
        }
    }

    const handleEdit = async (commentId: number) => {
        if (!editContent.trim() || !actions.update) return

        const updatedContent = editContent.trim()
        const updateAction = actions.update

        startTransition(async () => {
            // Update UI immediately
            updateOptimisticComments({ type: 'update', commentId, content: updatedContent })
            setEditingId(null)
            setEditContent("")

            // Call server action
            const result = await updateAction(commentId, updatedContent)
            if (result.success) {
                toast({ title: "Sucesso", description: "Comentário atualizado" })
            } else {
                toast({ title: "Erro", description: result.error, variant: "destructive" })
                // Optimistic state will auto-revert
            }
        })
    }

    const handleDelete = async (commentId: number) => {
        if (!confirm("Eliminar este comentário?") || !actions.delete) return

        const deleteAction = actions.delete

        startTransition(async () => {
            // Update UI immediately
            updateOptimisticComments({ type: 'delete', commentId })
            setMenuOpenId(null)

            // Call server action
            const result = await deleteAction(commentId)
            if (result.success) {
                toast({ title: "Sucesso", description: "Comentário eliminado" })
            } else {
                toast({ title: "Erro", description: result.error, variant: "destructive" })
                // Optimistic state will auto-revert
            }
        })
    }

    const startEditing = (comment: T) => {
        setEditingId(comment.id)
        setEditContent(comment.content)
        setMenuOpenId(null)
    }

    const canModify = (comment: T) => {
        return comment.createdBy === currentUserId || isManager
    }

    const canEdit = (comment: T) => {
        return allowEdit && comment.createdBy === currentUserId
    }

    const defaultClosedMessage = entityType === "discussion"
        ? "Esta discussão está encerrada. Não é possível adicionar comentários."
        : "Esta ocorrência está resolvida. Não é possível adicionar comentários."

    return (
        <div className="space-y-4">
            <h3 className="text-body font-semibold text-gray-700">
                Comentários ({optimisticComments.length})
            </h3>

            {optimisticComments.length === 0 ? (
                <p className="text-body text-gray-500 py-4">
                    {entityType === "discussion"
                        ? "Ainda não há comentários. Seja o primeiro a comentar!"
                        : "Ainda não há comentários."}
                </p>
            ) : (
                <div className="space-y-3">
                    {optimisticComments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                            {editingId === comment.id ? (
                                <div className="space-y-2">
                                    <Textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={3}
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleEdit(comment.id)}>
                                            Guardar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingId(null)
                                                setEditContent("")
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-body font-medium text-gray-700">
                                                {comment.creatorName || "Utilizador"}
                                            </span>
                                            {comment.isEdited && (
                                                <span className="text-label text-gray-400">(editado)</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-label text-gray-400">
                                                {formatDistanceToNow(comment.createdAt)}
                                            </span>
                                            {canModify(comment) && (allowEdit || allowDelete) && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setMenuOpenId(
                                                            menuOpenId === comment.id ? null : comment.id
                                                        )}
                                                        className="p-1 hover:bg-gray-200 rounded"
                                                    >
                                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                    {menuOpenId === comment.id && (
                                                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10">
                                                            {allowEdit && canEdit(comment) && actions.update && (
                                                                <button
                                                                    onClick={() => startEditing(comment)}
                                                                    className="flex items-center gap-2 px-3 py-2 text-body hover:bg-gray-50 w-full"
                                                                >
                                                                    <Edit className="w-4 h-4" /> Editar
                                                                </button>
                                                            )}
                                                            {allowDelete && actions.delete && (
                                                                <button
                                                                    onClick={() => handleDelete(comment.id)}
                                                                    className="flex items-center gap-2 px-3 py-2 text-body text-error hover:bg-gray-50 w-full"
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> Eliminar
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-body text-gray-600 whitespace-pre-wrap">
                                        {comment.content}
                                    </p>

                                    {/* Attachments for occurrences */}
                                    {allowAttachments && (comment as CommentWithAttachments).attachments &&
                                     (comment as CommentWithAttachments).attachments!.length > 0 && (
                                        <div className="mt-2">
                                            <PhotoGallery
                                                attachments={(comment as CommentWithAttachments).attachments!}
                                                canDelete={!isClosed}
                                                currentUserId={currentUserId}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!isClosed ? (
                <div className="pt-2 border-t border-gray-200">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escreva um comentário..."
                        rows={3}
                    />

                    {/* Photo preview for occurrences */}
                    {allowAttachments && photo && (
                        <div className="relative w-20 h-20 mt-2">
                            <img
                                src={photo.preview}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                                onClick={removePhoto}
                                className="absolute -top-2 -right-2 p-1 bg-error text-white rounded-full hover:bg-error/90"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                        {allowAttachments && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-1 text-body text-gray-500 hover:text-gray-700"
                            >
                                <Camera className="w-4 h-4" />
                                <span>Adicionar foto</span>
                            </button>
                        )}
                        <Button
                            onClick={handleSubmit}
                            disabled={(!content.trim() && !photo) || isPending}
                            size="sm"
                            className={!allowAttachments ? "ml-auto" : ""}
                        >
                            Comentar
                        </Button>
                    </div>

                    {allowAttachments && (
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handlePhotoSelect(e.target.files)}
                            className="hidden"
                        />
                    )}
                </div>
            ) : (
                <div className="pt-2 border-t border-gray-200">
                    <p className="text-body text-gray-500 text-center py-2">
                        {closedMessage || defaultClosedMessage}
                    </p>
                </div>
            )}
        </div>
    )
}
