"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2, Pin, PinOff, Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { DiscussionModal } from "./DiscussionModal"
import { DiscussionCommentSection } from "./DiscussionCommentSection"
import { Discussion, DiscussionComment } from "@/lib/types"
import { deleteDiscussion, toggleDiscussionPin, closeDiscussion } from "@/app/actions/discussions"
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
    const [isTogglingPin, setIsTogglingPin] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

    const isOwner = discussion.createdBy === currentUserId
    const canEdit = isOwner
    const canDelete = isManager || (isOwner && (comments.length === 0))

    const handleDelete = async () => {
        if (!confirm("Eliminar esta discussão?")) return

        setIsDeleting(true)
        const result = await deleteDiscussion(discussion.id)

        if (result.success) {
            toast({ title: "Sucesso", description: "Discussão eliminada" })
            router.push("/dashboard/discussions")
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
            setIsDeleting(false)
        }
    }

    const handleTogglePin = async () => {
        setIsTogglingPin(true)
        const result = await toggleDiscussionPin(discussion.id)

        if (result.success) {
            toast({
                title: "Sucesso",
                description: discussion.isPinned ? "Discussão desafixada" : "Discussão fixada"
            })
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
        }
        setIsTogglingPin(false)
    }

    const handleClose = async () => {
        if (!confirm("Encerrar esta discussão? Não será possível adicionar mais comentários.")) return

        setIsClosing(true)
        const result = await closeDiscussion(discussion.id)

        if (result.success) {
            toast({ title: "Sucesso", description: "Discussão encerrada" })
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
        }
        setIsClosing(false)
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
                            {discussion.isPinned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label font-medium bg-blue-100 text-blue-700">
                                    <Pin className="w-3 h-3" />
                                    Fixada
                                </span>
                            )}
                            {discussion.isClosed && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label font-medium bg-slate-100 text-slate-600">
                                    <Lock className="w-3 h-3" />
                                    Encerrada
                                </span>
                            )}
                            <span className="text-label text-slate-400">
                                {formatDistanceToNow(discussion.createdAt)}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            {isManager && !discussion.isClosed && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleTogglePin}
                                        isLoading={isTogglingPin}
                                    >
                                        {discussion.isPinned ? (
                                            <><PinOff className="w-4 h-4 mr-1" /> Desafixar</>
                                        ) : (
                                            <><Pin className="w-4 h-4 mr-1" /> Fixar</>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClose}
                                        isLoading={isClosing}
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

                    <h1 className="text-h3 font-bold text-slate-900 mb-2">
                        {discussion.title}
                    </h1>

                    <p className="text-body text-slate-500 mb-4">
                        Criado por {discussion.creatorName}
                    </p>

                    {discussion.content && (
                        <p className="text-body text-slate-700 whitespace-pre-wrap">
                            {discussion.content}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Comments */}
            <Card>
                <CardContent className="p-6">
                    <DiscussionCommentSection
                        discussionId={discussion.id}
                        comments={comments}
                        currentUserId={currentUserId}
                        currentUserName={currentUserName}
                        isManager={isManager}
                        isClosed={discussion.isClosed}
                    />
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <DiscussionModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                buildingId={buildingId}
                discussion={discussion}
            />
        </div>
    )
}