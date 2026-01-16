"use client"

import { useState, useEffect, useTransition } from "react"
import { Edit, Trash2, Send, Calendar } from "lucide-react"
import { Sheet } from "@/components/ui/Sheet"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Divider } from "@/components/ui/Divider"
import { Spinner } from "@/components/ui/Spinner"
import { IconButton } from "@/components/ui/Icon-Button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { PhotoGallery } from "./PhotoGallery"
import { OccurrenceModal } from "./OccurrenceModal"
import {
    getOccurrence,
    getOccurrenceComments,
    getOccurrenceAttachments,
    updateOccurrenceStatus,
    deleteOccurrence,   
    addOccurrenceComment,
} from "@/lib/actions/occurrences"
import { OccurrenceStatus, OccurrencePriority, Occurrence, OccurrenceComment, OccurrenceAttachment } from "@/lib/types"
import { OCCURRENCE_STATUS_CONFIG, OCCURRENCE_PRIORITY_CONFIG, OCCURRENCE_CATEGORY_OPTIONS } from "@/lib/constants/ui"
import { useToast } from "@/components/ui/Toast"
import { formatDistanceToNow, formatDateTime } from "@/lib/format"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Props {
    occurrenceId: number | null
    open: boolean
    onClose: () => void
    currentUserId: string
    currentUserName: string
    isManager: boolean
    buildingId: string
    managerId?: string
}

export function OccurrenceDetailSheet({
    occurrenceId,
    open,
    onClose,
    currentUserId,
    isManager,
    buildingId,
    managerId,
}: Props) {
    const router = useRouter()
    const { addToast } = useToast()
    const [occurrence, setOccurrence] = useState<Occurrence | null>(null)
    const [comments, setComments] = useState<OccurrenceComment[]>([])
    const [attachments, setAttachments] = useState<OccurrenceAttachment[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [newComment, setNewComment] = useState("")
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Fetch data when sheet opens
    useEffect(() => {
        if (open && occurrenceId) {
            setIsLoading(true)
            Promise.all([
                getOccurrence(occurrenceId),
                getOccurrenceComments(occurrenceId),
                getOccurrenceAttachments(occurrenceId),
            ])
                .then(([occ, comms, atts]) => {
                    setOccurrence(occ ? {
                        ...occ,
                        status: occ.status as OccurrenceStatus,
                        priority: (occ.priority || 'medium') as OccurrencePriority
                    } : null)
                    setComments(comms)
                    setAttachments(atts)
                })
                .finally(() => setIsLoading(false))
        }
    }, [open, occurrenceId])

    // Reset state when sheet closes
    useEffect(() => {
        if (!open) {
            setOccurrence(null)
            setComments([])
            setAttachments([])
            setNewComment("")
        }
    }, [open])

    const canEdit = occurrence?.createdBy === currentUserId && occurrence?.status === "open"
    const isClosed = occurrence?.status === "resolved"

    const handleStatusChange = (newStatus: OccurrenceStatus) => {
        if (!occurrence) return

        startTransition(async () => {
            const result = await updateOccurrenceStatus(occurrence.id, newStatus)
            if (result.success) {
                setOccurrence(prev => prev ? { ...prev, status: newStatus } : null)
                addToast({
                    title: "Estado atualizado",
                    description: `Ocorrência marcada como "${OCCURRENCE_STATUS_CONFIG[newStatus].label}".`,
                    variant: "success",
                })
                router.refresh()
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
        })
    }

    const handleDelete = () => {
        if (!occurrence) return
        setShowDeleteConfirm(true)
    }

    const confirmDelete = () => {
        if (!occurrence) return

        startTransition(async () => {
            const result = await deleteOccurrence(occurrence.id)
            if (result.success) {
                addToast({ title: "Sucesso", description: "Ocorrência eliminada", variant: "success" })
                router.refresh()
                onClose()
            } else {
                addToast({ title: "Erro", description: result.error, variant: "error" })
            }
            setShowDeleteConfirm(false)
        })
    }

    const handleAddComment = () => {
        if (!newComment.trim() || !occurrence) return

        startTransition(async () => {
            const result = await addOccurrenceComment(occurrence.id, newComment.trim())
            if (result.success) {
                const updatedComments = await getOccurrenceComments(occurrence.id)
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

    const getCategoryLabel = (type: string) => {
        const option = OCCURRENCE_CATEGORY_OPTIONS.find(o => o.value === type)
        return option?.label || type
    }

    if (!open) return null

    const statusConfig = occurrence ? OCCURRENCE_STATUS_CONFIG[occurrence.status] : null
    const priorityConfig = occurrence ? OCCURRENCE_PRIORITY_CONFIG[occurrence.priority as OccurrencePriority] || OCCURRENCE_PRIORITY_CONFIG.medium : null

    return (
        <>
            <Sheet
                open={open}
                onClose={onClose}
                title={occurrence?.title || "Carregando..."}
                description={occurrence ? `Reportado por ${occurrence.creatorName}` : undefined}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Spinner />
                    </div>
                ) : occurrence ? (
                    <div className="space-y-1.5">
                        {/* Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant={statusConfig?.variant}>{statusConfig?.label}</Badge>
                            <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium", priorityConfig?.bg, priorityConfig?.color)}>
                                {priorityConfig?.label}
                            </span>
                            <Badge variant="default">{getCategoryLabel(occurrence.type)}</Badge>
                        </div>

                        <Divider />

                        {/* Description */}
                        <div>
                            <p className="text-[9px] font-medium text-[#ADB5BD] uppercase tracking-wide mb-0.5">
                                Descrição
                            </p>
                            <p className="text-[11px] text-[#495057] whitespace-pre-wrap">
                                {occurrence.description || "Sem descrição"}
                            </p>
                        </div>

                        {/* Date */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-[9px] font-medium text-[#ADB5BD] uppercase tracking-wide mb-0.5">
                                    Data
                                </p>
                                <div className="flex items-center gap-1 text-[10px] text-[#6C757D]">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDateTime(occurrence.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        {attachments.length > 0 && (
                            <div>
                                <p className="text-[9px] font-medium text-[#ADB5BD] uppercase tracking-wide mb-1">
                                    Fotos
                                </p>
                                <PhotoGallery
                                    attachments={attachments}
                                    canDelete={occurrence.status === "open"}
                                    currentUserId={currentUserId}
                                />
                            </div>
                        )}

                        <Divider />

                        {/* Actions */}
                        {canEdit && (
                            <div className="flex gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditModalOpen(true)}
                                    className="text-[10px] h-6 px-2"
                                >
                                    <Edit className="w-3 h-3 mr-1" /> Editar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-[10px] h-6 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={handleDelete}
                                    disabled={isPending}
                                >
                                    <Trash2 className="w-3 h-3 mr-1" /> Eliminar
                                </Button>
                            </div>
                        )}

                        {/* Status Change (Manager Only) */}
                        {isManager && (
                            <div>
                                <p className="text-[9px] font-medium text-[#ADB5BD] uppercase tracking-wide mb-1">
                                    Alterar Estado
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {(Object.keys(OCCURRENCE_STATUS_CONFIG) as OccurrenceStatus[]).map((status) => (
                                        <Button
                                            key={status}
                                            variant={occurrence.status === status ? "primary" : "outline"}
                                            size="sm"
                                            onClick={() => handleStatusChange(status)}
                                            disabled={isPending}
                                            className="text-[10px] h-6 px-2"
                                        >
                                            {OCCURRENCE_STATUS_CONFIG[status].label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Divider />

                        {/* Comments */}
                        <div>
                            <p className="text-[9px] font-medium text-[#ADB5BD] uppercase tracking-wide mb-1">
                                Comentários ({comments.length})
                            </p>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                {comments.length === 0 ? (
                                    <p className="text-[10px] text-[#ADB5BD] italic">Sem comentários</p>
                                ) : (
                                    comments.map((comment) => {
                                        const isManagerComment = comment.createdBy === managerId || isManager && comment.createdBy === currentUserId
                                        return (
                                            <div
                                                key={comment.id}
                                                className={cn(
                                                    "rounded-md p-2",
                                                    isManagerComment ? "bg-[#E8F4EA]" : "bg-[#F8F9FA]"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] font-medium text-[#495057]">
                                                            {comment.creatorName}
                                                        </span>
                                                        {isManagerComment && (
                                                            <Badge variant="success" className="ml-1">Admin</Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] text-[#ADB5BD]">
                                                        {formatDistanceToNow(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-[#6C757D]">{comment.content}</p>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {/* Add Comment */}
                            {!isClosed ? (
                                <div className="flex gap-1.5 mt-2">
                                    <Input
                                        placeholder="Adicionar comentário..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                                        className="flex-1 text-[10px] h-7"
                                    />
                                    <IconButton
                                        icon={<Send className="h-3.5 w-3.5" />}
                                        label="Enviar comentário"
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim() || isPending}
                                        className="bg-[#8FB996] text-white hover:bg-[#7DA886]"
                                    />
                                </div>
                            ) : (
                                <p className="text-[10px] text-[#ADB5BD] text-center py-2 mt-2">
                                    Esta ocorrência está resolvida.
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-[11px] text-[#ADB5BD] text-center py-4">
                        Ocorrência não encontrada.
                    </p>
                )}
            </Sheet>

            {/* Edit Modal */}
            {occurrence && (
                <OccurrenceModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    buildingId={buildingId}
                    occurrence={occurrence}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Eliminar ocorrência"
                message="Tem a certeza que deseja eliminar esta ocorrência?"
                variant="danger"
                confirmText="Eliminar"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                loading={isPending}
            />
        </>
    )
}