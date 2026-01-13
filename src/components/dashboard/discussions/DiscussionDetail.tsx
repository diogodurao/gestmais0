"use client"

import { useState, useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2, Pin, PinOff, Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { DiscussionModal } from "./DiscussionModal"
import { CommentSection } from "@/components/ui/CommentSection"
import { Discussion, DiscussionComment } from "@/lib/types"
import {
    deleteDiscussion,
    toggleDiscussionPin,
    closeDiscussion,
    addDiscussionComment,
    updateDiscussionComment,
    deleteDiscussionComment
} from "@/lib/actions/discussions"
import { useToast } from "@/components/ui/Toast"
import { formatDistanceToNow } from "@/lib/format"

interface Props {
    discussion: Discussion
    comments: DiscussionComment[]
    isManager: boolean
    currentUserId: string
    currentUserName: string
    buildingId: string
}

export function DiscussionDetail({
    discussion,
    comments,
    isManager,
    currentUserId,
    currentUserName,
    buildingId,
}: Props) {
    const router = useRouter()
    const { toast } = useToast()
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isTogglingPin, startPinTransition] = useTransition()
    const [isClosing, startCloseTransition] = useTransition()

    // Optimistic state for discussion
    const [optimisticDiscussion, setOptimisticDiscussion] = useOptimistic(
        discussion,
        (state, update: Partial<Discussion>) => ({
            ...state,
            ...update
        })
    )

    const isOwner = optimisticDiscussion.createdBy === currentUserId
    const canEdit = isOwner
    const canDelete = isManager || (isOwner && (comments.length === 0))

    const handleDelete = async () => {
        if (!confirm("Eliminar esta discussão?")) return

        setIsDeleting(true)
        const result = await deleteDiscussion(optimisticDiscussion.id)

        if (result.success) {
            toast({ title: "Sucesso", description: "Discussão eliminada" })
            router.push("/dashboard/discussions")
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
            setIsDeleting(false)
        }
    }

    const handleTogglePin = async () => {
        const newPinnedState = !optimisticDiscussion.isPinned

        startPinTransition(async () => {
            // Update UI immediately
            setOptimisticDiscussion({ isPinned: newPinnedState })

            // Call server action
            const result = await toggleDiscussionPin(optimisticDiscussion.id)

            if (result.success) {
                toast({
                    title: "Sucesso",
                    description: newPinnedState ? "Discussão fixada" : "Discussão desafixada"
                })
                // Refresh to sync with server
                router.refresh()
            } else {
                toast({ title: "Erro", description: result.error, variant: "destructive" })
                // Optimistic state auto-reverts
            }
        })
    }

    const handleClose = async () => {
        if (!confirm("Encerrar esta discussão? Não será possível adicionar mais comentários.")) return

        startCloseTransition(async () => {
            // Update UI immediately
            setOptimisticDiscussion({ isClosed: true })

            // Call server action
            const result = await closeDiscussion(optimisticDiscussion.id)

            if (result.success) {
                toast({ title: "Sucesso", description: "Discussão encerrada" })
                // Refresh to sync with server
                router.refresh()
            } else {
                toast({ title: "Erro", description: result.error, variant: "destructive" })
                // Optimistic state auto-reverts
            }
        })
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard/discussions">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                    </Button>
                </Link>
            </div>

            {/* Discussion Content */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {optimisticDiscussion.isPinned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label font-medium bg-info-light text-info">
                                    <Pin className="w-3 h-3" />
                                    Fixada
                                </span>
                            )}
                            {optimisticDiscussion.isClosed && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label font-medium bg-gray-100 text-gray-600">
                                    <Lock className="w-3 h-3" />
                                    Encerrada
                                </span>
                            )}
                            <span className="text-label text-gray-400">
                                {formatDistanceToNow(optimisticDiscussion.createdAt)}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            {isManager && !optimisticDiscussion.isClosed && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleTogglePin}
                                        loading={isTogglingPin}
                                    >
                                        {optimisticDiscussion.isPinned ? (
                                            <><PinOff className="w-4 h-4 mr-1" /> Desafixar</>
                                        ) : (
                                            <><Pin className="w-4 h-4 mr-1" /> Fixar</>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClose}
                                        loading={isClosing}
                                    >
                                        <Lock className="w-4 h-4 mr-1" /> Encerrar
                                    </Button>
                                </>
                            )}
                            {canEdit && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditModalOpen(true)}
                                >
                                    <Edit className="w-4 h-4 mr-1" /> Editar
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={handleDelete}
                                    isLoading={isDeleting}
                                >
                                    <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                                </Button>
                            )}
                        </div>
                    </div>

                    <h1 className="text-h3 font-bold text-gray-900 mb-2">
                        {optimisticDiscussion.title}
                    </h1>

                    <p className="text-body text-gray-500 mb-4">
                        Criado por {optimisticDiscussion.creatorName}
                    </p>

                    {optimisticDiscussion.content && (
                        <p className="text-body text-gray-700 whitespace-pre-wrap">
                            {optimisticDiscussion.content}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Comments */}
            <Card>
                <CardContent className="p-6">
                    <CommentSection
                        entityId={optimisticDiscussion.id}
                        entityType="discussion"
                        comments={comments}
                        currentUserId={currentUserId}
                        currentUserName={currentUserName}
                        isManager={isManager}
                        isClosed={optimisticDiscussion.isClosed}
                        actions={{
                            add: addDiscussionComment,
                            update: updateDiscussionComment,
                            delete: deleteDiscussionComment,
                        }}
                        features={{
                            allowEdit: true,
                            allowDelete: true,
                            allowAttachments: false,
                        }}
                    />
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <DiscussionModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                buildingId={buildingId}
                discussion={optimisticDiscussion}
            />
        </div>
    )
}