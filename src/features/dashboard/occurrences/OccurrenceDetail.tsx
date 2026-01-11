"use client"

import { useState, useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { FormField, FormLabel, FormControl, FormError } from "@/components/ui/Formfield"
import { OccurrenceModal } from "./OccurrenceModal"
import { CommentSection } from "@/components/ui/CommentSection"
import { PhotoGallery } from "./PhotoGallery"
import { Occurrence, OccurrenceComment, OccurrenceStatus, OccurrenceAttachment } from "@/lib/types"
import { OCCURRENCE_STATUS_CONFIG } from "@/lib/constants"
import { deleteOccurrence, updateOccurrenceStatus, addOccurrenceComment } from "@/app/actions/occurrences"
import { useToast } from "@/components/ui/Toast"
import { formatDistanceToNow } from "@/lib/format"

interface Props {
    occurrence: Occurrence
    comments: OccurrenceComment[]
    attachments: OccurrenceAttachment[]
    canEdit: boolean
    canChangeStatus: boolean
    currentUserId: string
    currentUserName: string
    buildingId: string
}

export function OccurrenceDetail({
    occurrence,
    comments,
    attachments,
    canEdit,
    canChangeStatus,
    currentUserId,
    currentUserName,
    buildingId,
}: Props) {
    const router = useRouter()
    const { toast } = useToast()
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdatingStatus, startTransition] = useTransition()

    // Optimistic state for occurrence status
    const [optimisticOccurrence, setOptimisticOccurrence] = useOptimistic(
        occurrence,
        (state, newStatus: OccurrenceStatus) => ({
            ...state,
            status: newStatus
        })
    )

    const handleDelete = async () => {
        if (!confirm("Eliminar esta ocorrência?")) return

        setIsDeleting(true)
        const result = await deleteOccurrence(occurrence.id)

        if (result.success) {
            toast({ title: "Sucesso", description: "Ocorrência eliminada" })
            router.push("/dashboard/occurrences")
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" })
            setIsDeleting(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        const status = newStatus as OccurrenceStatus

        startTransition(async () => {
            // Update UI immediately
            setOptimisticOccurrence(status)

            // Call server action
            const result = await updateOccurrenceStatus(occurrence.id, status)

            if (result.success) {
                toast({ title: "Sucesso", description: "Estado atualizado" })
                // Refresh to get real data from server
                router.refresh()
            } else {
                toast({ title: "Erro", description: result.error, variant: "destructive" })
                // Optimistic state will auto-revert on error
            }
        })
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard/occurrences">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                    </Button>
                </Link>
            </div>

            {/* Main Content */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Badge status={optimisticOccurrence.status} config={OCCURRENCE_STATUS_CONFIG} />
                            <span className="text-label text-gray-400">
                                {formatDistanceToNow(optimisticOccurrence.createdAt)}
                            </span>
                        </div>

                        {canEdit && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditModalOpen(true)}
                                >
                                    <Edit className="w-4 h-4 mr-1" /> Editar
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={handleDelete}
                                    isLoading={isDeleting}
                                >
                                    <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                                </Button>
                            </div>
                        )}
                    </div>

                    <h1 className="text-h3 font-bold text-gray-900 mb-2">
                        {optimisticOccurrence.title}
                    </h1>

                    <p className="text-body text-gray-500 mb-4">
                        Tipo: {optimisticOccurrence.type} • Reportado por {optimisticOccurrence.creatorName}
                    </p>

                    {optimisticOccurrence.description && (
                        <p className="text-body text-gray-700 whitespace-pre-wrap mb-4">
                            {optimisticOccurrence.description}
                        </p>
                    )}

                    {/* Occurrence Photos */}
                    {attachments.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-label font-bold text-gray-500 uppercase mb-2">
                                Fotos
                            </h4>
                            <PhotoGallery
                                attachments={attachments}
                                canDelete={optimisticOccurrence.status === 'open'}
                                currentUserId={currentUserId}
                            />
                        </div>
                    )}

                    {/* Status Control (Manager Only) */}
                    {canChangeStatus && (
                        <div className="pt-4 border-t border-gray-200">
                            <FormField>
                                <FormLabel>Alterar Estado</FormLabel>
                                <FormControl>
                                    {(props) => (
                                        <Select
                                            {...props}
                                            options={Object.entries(OCCURRENCE_STATUS_CONFIG).map(([value, { label }]) => ({
                                                value,
                                                label,
                                            }))}
                                            value={optimisticOccurrence.status}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusChange(e.target.value)}
                                            disabled={isUpdatingStatus}
                                        />
                                    )}
                                </FormControl>
                                <FormError />
                            </FormField>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Comments */}
            <Card>
                <CardContent className="p-6">
                    <CommentSection
                        entityId={optimisticOccurrence.id}
                        entityType="occurrence"
                        comments={comments}
                        currentUserId={currentUserId}
                        currentUserName={currentUserName}
                        isManager={canChangeStatus}
                        isClosed={optimisticOccurrence.status === 'resolved'}
                        actions={{
                            add: addOccurrenceComment,
                        }}
                        features={{
                            allowEdit: false,
                            allowDelete: false,
                            allowAttachments: true,
                        }}
                    />
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <OccurrenceModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                buildingId={buildingId}
                occurrence={occurrence}
            />
        </div>
    )
}