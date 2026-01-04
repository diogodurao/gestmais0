"use client"

import { useState, useOptimistic, useTransition } from "react"
import { Edit, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import {
    addDiscussionComment,
    updateDiscussionComment,
    deleteDiscussionComment
} from "@/app/actions/discussions"
import { DiscussionComment } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Props {
    discussionId: number
    comments: DiscussionComment[]
    currentUserId: string
    currentUserName: string
    isManager: boolean
    isClosed: boolean
}

export function DiscussionCommentSection({
    discussionId,
    comments,
    currentUserId,
    currentUserName,
    isManager,
    isClosed,
}: Props) {
    const { toast } = useToast()
    const [content, setContent] = useState("")
    const [isPending, startTransition] = useTransition()
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editContent, setEditContent] = useState("")
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null)

    const [optimisticComments, addOptimisticComment] = useOptimistic(
        comments,
        (state, newComment: DiscussionComment) => [...state, newComment]
    )

    const handleSubmit = () => {
        if (!content.trim() || isClosed) return

        const optimisticComment: DiscussionComment = {
            id: Date.now(),
            discussionId,
            content: content.trim(),
            isEdited: false,
            createdBy: currentUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
            creatorName: currentUserName,
        }

        startTransition(async () => {
            addOptimisticComment(optimisticComment)
            setContent("")

            const result = await addDiscussionComment(discussionId, content.trim())
            if (!result.success) {
                toast({ title: "Erro", description: result.error, variant: "destructive" })
            }
        })
    }

    const handleEdit = async (commentId: number) => {
        if (!editContent.trim()) return

        const result = await updateDiscussionComment(commentId, editContent.trim())
        if (result.success) {
            toast({ title: "Sucesso", description: "Comentário atualizado" })
            setEditingId(null)
            setEditContent("")
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
        }
    }

    const handleDelete = async (commentId: number) => {
        if (!confirm("Eliminar este comentário?")) return

        const result = await deleteDiscussionComment(commentId)
        if (result.success) {
            toast({ title: "Sucesso", description: "Comentário eliminado" })
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
        }
    }

    const startEditing = (comment: DiscussionComment) => {
        setEditingId(comment.id)
        setEditContent(comment.content)
        setMenuOpenId(null)
    }

    const canModify = (comment: DiscussionComment) => {
        return comment.createdBy === currentUserId || isManager
    }

    return (
        <div className="space-y-4">
            <h3 className="text-body font-bold text-slate-700">
                Comentários ({optimisticComments.length})
            </h3>

            {optimisticComments.length === 0 ? (
                <p className="text-body text-slate-500 py-4">
                    Ainda não há comentários. Seja o primeiro a comentar!
                </p>
            ) : (
                <div className="space-y-3">
                    {optimisticComments.map((comment) => (
                        <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
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
                                            <span className="text-body font-medium text-slate-700">
                                                {comment.creatorName}
                                            </span>
                                            {comment.isEdited && (
                                                <span className="text-label text-slate-400">(editado)</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-label text-slate-400">
                                                {formatDistanceToNow(comment.createdAt)}
                                            </span>
                                            {canModify(comment) && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setMenuOpenId(
                                                            menuOpenId === comment.id ? null : comment.id
                                                        )}
                                                        className="p-1 hover:bg-slate-200 rounded"
                                                    >
                                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                    {menuOpenId === comment.id && (
                                                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded shadow-lg z-10">
                                                            {comment.createdBy === currentUserId && (
                                                                <button
                                                                    onClick={() => startEditing(comment)}
                                                                    className="flex items-center gap-2 px-3 py-2 text-body hover:bg-slate-50 w-full"
                                                                >
                                                                    <Edit className="w-4 h-4" /> Editar
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(comment.id)}
                                                                className="flex items-center gap-2 px-3 py-2 text-body text-red-600 hover:bg-slate-50 w-full"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Eliminar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-body text-slate-600 whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                </>
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
                    <div className="mt-2 flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={!content.trim() || isPending}
                            size="sm"
                        >
                            Comentar
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="pt-2 border-t border-slate-200">
                    <p className="text-body text-slate-500 text-center py-2">
                        Esta discussão está encerrada. Não é possível adicionar comentários.
                    </p>
                </div>
            )}
        </div>
    )
}