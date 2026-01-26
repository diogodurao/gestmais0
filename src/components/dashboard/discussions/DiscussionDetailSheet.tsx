"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Edit, Trash2, Send, Pin, PinOff, Lock, Calendar, MessageSquare } from "lucide-react"
import { Sheet } from "@/components/ui/Sheet"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Divider } from "@/components/ui/Divider"
import { Spinner } from "@/components/ui/Spinner"
import { IconButton } from "@/components/ui/Icon-Button"
import { Avatar } from "@/components/ui/Avatar"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { DiscussionModal } from "./DiscussionModal"
import {
    getDiscussion,
    getDiscussionComments,
    deleteDiscussion,
    toggleDiscussionPin,
    closeDiscussion,
    addDiscussionComment,
    updateDiscussionComment,
    deleteDiscussionComment,
} from "@/lib/actions/discussions"
import { Discussion, DiscussionComment } from "@/lib/types"
import { useToast } from "@/components/ui/Toast"
import { formatDistanceToNow, formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Props {
    discussionId: number | null
    open: boolean
    onClose: () => void
    currentUserId: string
    currentUserName: string
    isManager: boolean
    buildingId: string
}

export function DiscussionDetailSheet({
    discussionId,
    open,
    onClose,
    currentUserId,
    currentUserName,
    isManager,
    buildingId,
}: Props) {
    const router = useRouter()
    const { addToast } = useToast()
    const [discussion, setDiscussion] = useState<Discussion | null>(null)
    const [comments, setComments] = useState<DiscussionComment[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [newComment, setNewComment] = useState("")
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
    const [editingCommentContent, setEditingCommentContent] = useState("")
    const [isPending, startTransition] = useTransition()
    const [confirmModal, setConfirmModal] = useState<{ type: "delete" | "close" | "deleteComment"; commentId?: number } | null>(null)

    // Fetch data when sheet opens
    useEffect(() => {
        if (open && discussionId) {
            setIsLoading(true)
            Promise.all([
                getDiscussion(discussionId),
                getDiscussionComments(discussionId),
            ])
                .then(([disc, comms]) => {
                    setDiscussion(disc)
                    setComments(comms)
                })
                .finally(() => setIsLoading(false))
        }
    }, [open, discussionId])

    // Reset state when sheet closes
    useEffect(() => {
        if (!open) {
            setDiscussion(null)
            setComments([])
            setNewComment("")
            setEditingCommentId(null)
            setEditingCommentContent("")
        }
    }, [open])

    const isOwner = discussion?.createdBy === currentUserId
    const canEdit = isOwner && !discussion?.isClosed
    const canDelete = isManager || (isOwner && comments.length === 0)
    const isClosed = discussion?.isClosed

    const handleDelete = () => {
        if (!discussion) return
        setConfirmModal({ type: "delete" })
    }

    const confirmDelete = () => {
        if (!discussion) return

        startTransition(async () => {
            const result = await deleteDiscussion(discussion.id)
            if (result.success) {
                addToast({ title: "Sucesso", description: "Discussão eliminada", variant: "success" })
                router.refresh()
                onClose()
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
            setConfirmModal(null)
        })
    }

    const handleTogglePin = () => {
        if (!discussion) return

        startTransition(async () => {
            const result = await toggleDiscussionPin(discussion.id)
            if (result.success) {
                const newPinnedState = !discussion.isPinned
                setDiscussion(prev => prev ? { ...prev, isPinned: newPinnedState } : null)
                addToast({
                    title: "Sucesso",
                    description: newPinnedState ? "Discussão fixada" : "Discussão desafixada",
                    variant: "success",
                })
                router.refresh()
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
        })
    }

    const handleCloseDiscussion = () => {
        if (!discussion) return
        setConfirmModal({ type: "close" })
    }

    const confirmClose = () => {
        if (!discussion) return

        startTransition(async () => {
            const result = await closeDiscussion(discussion.id)
            if (result.success) {
                setDiscussion(prev => prev ? { ...prev, isClosed: true } : null)
                addToast({ title: "Sucesso", description: "Discussão encerrada", variant: "success" })
                router.refresh()
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
            setConfirmModal(null)
        })
    }

    const handleAddComment = () => {
        if (!newComment.trim() || !discussion) return

        startTransition(async () => {
            const result = await addDiscussionComment(discussion.id, newComment.trim())
            if (result.success) {
                const updatedComments = await getDiscussionComments(discussion.id)
                setComments(updatedComments)
                setNewComment("")
                addToast({
                    title: "Comentário adicionado",
                    description: "O seu comentário foi publicado.",
                    variant: "success",
                })
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
        })
    }

    const handleEditComment = (comment: DiscussionComment) => {
        setEditingCommentId(comment.id)
        setEditingCommentContent(comment.content)
    }

    const handleSaveCommentEdit = () => {
        if (!editingCommentId || !editingCommentContent.trim()) return

        startTransition(async () => {
            const result = await updateDiscussionComment(editingCommentId, editingCommentContent.trim())
            if (result.success) {
                setComments(prev => prev.map(c =>
                    c.id === editingCommentId
                        ? { ...c, content: editingCommentContent.trim(), isEdited: true }
                        : c
                ))
                setEditingCommentId(null)
                setEditingCommentContent("")
                addToast({ title: "Sucesso", description: "Comentário atualizado", variant: "success" })
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
        })
    }

    const handleDeleteComment = (commentId: number) => {
        setConfirmModal({ type: "deleteComment", commentId })
    }

    const confirmDeleteComment = () => {
        if (!confirmModal?.commentId) return

        const commentId = confirmModal.commentId
        startTransition(async () => {
            const result = await deleteDiscussionComment(commentId)
            if (result.success) {
                setComments(prev => prev.filter(c => c.id !== commentId))
                addToast({ title: "Sucesso", description: "Comentário eliminado", variant: "success" })
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
            setConfirmModal(null)
        })
    }

    if (!open) return null

    return (
        <>
            <Sheet
                open={open}
                onClose={onClose}
                title={discussion?.title || "Carregando..."}
                description={discussion ? `Por ${discussion.creatorName}` : undefined}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Spinner />
                    </div>
                ) : discussion ? (
                    <div className="space-y-1.5">
                        {/* Status Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {discussion.isPinned && (
                                <Badge variant="info">
                                    <Pin className="h-3 w-3 mr-0.5" /> Fixada
                                </Badge>
                            )}
                            {discussion.isClosed && (
                                <Badge variant="default">
                                    <Lock className="h-3 w-3 mr-0.5" /> Encerrada
                                </Badge>
                            )}
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-1 text-label text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDateTime(discussion.createdAt)}</span>
                        </div>

                        <Divider />

                        {/* Content */}
                        {discussion.content && (
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                                    Conteúdo
                                </p>
                                <p className="text-body text-gray-600 whitespace-pre-wrap leading-relaxed">
                                    {discussion.content}
                                </p>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-secondary">
                            <span className="flex items-center gap-0.5">
                                <MessageSquare className="h-3 w-3" />
                                {comments.length} comentários
                            </span>
                        </div>

                        <Divider />

                        {/* Actions */}
                        {!isClosed && (canEdit || isManager) && (
                            <div className="flex flex-wrap gap-1.5">
                                {canEdit && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditModalOpen(true)}
                                        className="text-label h-6 px-2"
                                    >
                                        <Edit className="w-3 h-3 mr-1" /> Editar
                                    </Button>
                                )}
                                {isManager && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleTogglePin}
                                            disabled={isPending}
                                            className="text-label h-6 px-2"
                                        >
                                            {discussion.isPinned ? (
                                                <><PinOff className="w-3 h-3 mr-1" /> Desafixar</>
                                            ) : (
                                                <><Pin className="w-3 h-3 mr-1" /> Fixar</>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCloseDiscussion}
                                            disabled={isPending}
                                            className="text-label h-6 px-2"
                                        >
                                            <Lock className="w-3 h-3 mr-1" /> Encerrar
                                        </Button>
                                    </>
                                )}
                                {canDelete && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-label h-6 px-2 text-error border-error-light hover:bg-error-light"
                                        onClick={handleDelete}
                                        disabled={isPending}
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" /> Eliminar
                                    </Button>
                                )}
                            </div>
                        )}

                        <Divider />

                        {/* Comments Section */}
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                                Comentários ({comments.length})
                            </p>
                            <div className="space-y-1.5 max-h-64 overflow-y-auto">
                                {comments.length === 0 ? (
                                    <p className="text-label text-gray-400 italic py-4 text-center">
                                        Seja o primeiro a comentar
                                    </p>
                                ) : (
                                    comments.map((comment) => {
                                        const isCommentOwner = comment.createdBy === currentUserId
                                        const canEditComment = isCommentOwner && !isClosed
                                        const canDeleteComment = (isManager || isCommentOwner) && !isClosed

                                        return (
                                            <div
                                                key={comment.id}
                                                className={cn(
                                                    "rounded-md p-2",
                                                    isManager && comment.createdBy === currentUserId
                                                        ? "bg-primary-light"
                                                        : "bg-gray-100"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <div className="flex items-center gap-1">
                                                        <Avatar size="sm" fallback={comment.creatorName?.charAt(0) || "?"} alt={comment.creatorName || ""} />
                                                        <span className="text-label font-medium text-gray-600">
                                                            {comment.creatorName}
                                                        </span>
                                                        {comment.isEdited && (
                                                            <span className="text-micro text-gray-400">(editado)</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {formatDistanceToNow(comment.createdAt)}
                                                    </span>
                                                </div>

                                                {editingCommentId === comment.id ? (
                                                    <div className="ml-6 space-y-1">
                                                        <Input
                                                            value={editingCommentContent}
                                                            onChange={(e) => setEditingCommentContent(e.target.value)}
                                                            className="text-label"
                                                        />
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                onClick={handleSaveCommentEdit}
                                                                disabled={isPending}
                                                                className="text-xs h-5 px-2"
                                                            >
                                                                Guardar
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setEditingCommentId(null)
                                                                    setEditingCommentContent("")
                                                                }}
                                                                className="text-xs h-5 px-2"
                                                            >
                                                                Cancelar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-label text-gray-500 ml-6">{comment.content}</p>
                                                        {(canEditComment || canDeleteComment) && (
                                                            <div className="flex items-center gap-2 mt-1 ml-6">
                                                                {canEditComment && (
                                                                    <button
                                                                        onClick={() => handleEditComment(comment)}
                                                                        className="text-xs text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        Editar
                                                                    </button>
                                                                )}
                                                                {canDeleteComment && (
                                                                    <button
                                                                        onClick={() => handleDeleteComment(comment.id)}
                                                                        className="text-xs text-gray-400 hover:text-error"
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {/* Add Comment */}
                            {!isClosed ? (
                                <div className="flex gap-1.5 mt-2">
                                    <Input
                                        placeholder="Escreva um comentário..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                                        className="flex-1 text-label h-7"
                                    />
                                    <IconButton
                                        icon={<Send className="h-3.5 w-3.5" />}
                                        label="Enviar comentário"
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim() || isPending}
                                        className="bg-primary text-white hover:bg-primary-dark"
                                    />
                                </div>
                            ) : (
                                <p className="text-label text-gray-400 text-center py-2 mt-2">
                                    Esta discussão está encerrada.
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-body text-gray-400 text-center py-4">
                        Discussão não encontrada.
                    </p>
                )}
            </Sheet>

            {/* Edit Modal */}
            {discussion && (
                <DiscussionModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    buildingId={buildingId}
                    discussion={discussion}
                />
            )}

            {/* Confirmation Modals */}
            <ConfirmModal
                isOpen={confirmModal?.type === "delete"}
                title="Eliminar discussão"
                message="Tem a certeza que deseja eliminar esta discussão? Esta ação não pode ser desfeita."
                variant="danger"
                confirmText="Eliminar"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmModal(null)}
                loading={isPending}
            />

            <ConfirmModal
                isOpen={confirmModal?.type === "close"}
                title="Encerrar discussão"
                message="Tem a certeza que deseja encerrar esta discussão? Não será possível adicionar mais comentários."
                variant="warning"
                confirmText="Encerrar"
                onConfirm={confirmClose}
                onCancel={() => setConfirmModal(null)}
                loading={isPending}
            />

            <ConfirmModal
                isOpen={confirmModal?.type === "deleteComment"}
                title="Eliminar comentário"
                message="Tem a certeza que deseja eliminar este comentário?"
                variant="danger"
                confirmText="Eliminar"
                onConfirm={confirmDeleteComment}
                onCancel={() => setConfirmModal(null)}
                loading={isPending}
            />
        </>
    )
}