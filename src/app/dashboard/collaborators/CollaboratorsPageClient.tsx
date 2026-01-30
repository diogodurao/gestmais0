"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, Users, Clock, Trash2, X, Mail } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/Empty-State"
import { Select } from "@/components/ui/Select"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useToast } from "@/components/ui/Toast"
import { CollaboratorInvitation, Collaborator } from "@/lib/types"
import {
    inviteCollaborator,
    cancelCollaboratorInvitation,
    removeCollaborator
} from "@/lib/actions/collaborators"
import { cn } from "@/lib/utils"

interface CollaboratorsPageClientProps {
    buildingId: string
    isOwner: boolean
    collaborators: Collaborator[]
    pendingInvitations: CollaboratorInvitation[]
    eligibleResidents: Array<{ id: string; name: string; email: string; unit: string }>
}

export function CollaboratorsPageClient({
    buildingId,
    isOwner,
    collaborators,
    pendingInvitations,
    eligibleResidents
}: CollaboratorsPageClientProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [isPending, startTransition] = useTransition()

    // Form state
    const [selectedResidentId, setSelectedResidentId] = useState<string>("")

    // Confirm modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        title: string
        message: string
        action: () => void
        variant: "danger" | "warning"
    }>({
        isOpen: false,
        title: "",
        message: "",
        action: () => { },
        variant: "danger"
    })

    const handleInvite = () => {
        if (!selectedResidentId) {
            addToast({ variant: "error", title: "Selecione um residente" })
            return
        }

        startTransition(async () => {
            const result = await inviteCollaborator(buildingId, selectedResidentId)
            if (result.success) {
                addToast({ variant: "success", title: "Convite enviado com sucesso" })
                setSelectedResidentId("")
                router.refresh()
            } else {
                addToast({ variant: "error", title: result.error })
            }
        })
    }

    const handleCancelInvitation = (invitation: CollaboratorInvitation) => {
        setConfirmModal({
            isOpen: true,
            title: "Cancelar Convite",
            message: `Tem a certeza que pretende cancelar o convite para ${invitation.invitedUserName}?`,
            variant: "warning",
            action: () => {
                startTransition(async () => {
                    const result = await cancelCollaboratorInvitation(invitation.id, buildingId)
                    if (result.success) {
                        addToast({ variant: "success", title: "Convite cancelado" })
                        router.refresh()
                    } else {
                        addToast({ variant: "error", title: result.error })
                    }
                })
            }
        })
    }

    const handleRemoveCollaborator = (collaborator: Collaborator) => {
        setConfirmModal({
            isOpen: true,
            title: "Remover Colaborador",
            message: `Tem a certeza que pretende remover ${collaborator.name} como colaborador? Esta ação não pode ser desfeita.`,
            variant: "danger",
            action: () => {
                startTransition(async () => {
                    const result = await removeCollaborator(buildingId, collaborator.managerId)
                    if (result.success) {
                        addToast({ variant: "success", title: "Colaborador removido" })
                        router.refresh()
                    } else {
                        addToast({ variant: "error", title: result.error })
                    }
                })
            }
        })
    }

    const formatDate = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date
        return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    return (
        <div className="flex-1 overflow-y-auto p-1.5">
            {/* Header */}
            <div className="mb-1.5">
                <h1 className="text-heading font-semibold text-gray-800">
                    Colaboradores
                </h1>
                <p className="text-label text-gray-500">
                    Gerir colaboradores que ajudam na gestão do edifício
                </p>
            </div>

            <div className="space-y-1.5">
                {/* Invite Section - Only for owners */}
                {isOwner && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-1.5">
                                <UserPlus className="w-4 h-4" />
                                Convidar Colaborador
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-body text-gray-600 mb-1.5">
                                Convide um residente do edifício para colaborar na gestão. Os colaboradores podem
                                ajudar a gerir quotas, eventos, votações e ocorrências.
                            </p>

                            {eligibleResidents.length > 0 ? (
                                <div className="flex gap-1.5 items-end">
                                    <div className="flex-1">
                                        <Select
                                            value={selectedResidentId}
                                            onChange={(e) => setSelectedResidentId(e.target.value)}
                                            disabled={isPending}
                                        >
                                            <option value="">Selecionar residente...</option>
                                            {eligibleResidents.map((resident) => (
                                                <option key={resident.id} value={resident.id}>
                                                    {resident.name} - {resident.unit}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={handleInvite}
                                        disabled={!selectedResidentId || isPending}
                                        size="md"
                                    >
                                        <Mail className="w-3.5 h-3.5 mr-1" />
                                        Enviar Convite
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                    <p className="text-label text-gray-500 text-center">
                                        {collaborators.length > 0 || pendingInvitations.length > 0
                                            ? "Todos os residentes elegíveis já foram convidados ou são colaboradores."
                                            : "Não existem residentes elegíveis para convite."}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pending Invitations - Only for owners */}
                {isOwner && pendingInvitations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                Convites Pendentes
                                <Badge variant="warning" size="sm">{pendingInvitations.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {pendingInvitations.map((invitation) => (
                                    <div
                                        key={invitation.id}
                                        className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 border border-gray-200"
                                    >
                                        <div>
                                            <p className="text-body font-medium text-gray-700">
                                                {invitation.invitedUserName}
                                            </p>
                                            <p className="text-label text-gray-500">
                                                Enviado em {formatDate(invitation.createdAt)} · Expira em {formatDate(invitation.expiresAt)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCancelInvitation(invitation)}
                                            disabled={isPending}
                                            className="text-gray-600 hover:text-error hover:border-error-light"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Current Collaborators */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            Colaboradores Atuais
                            {collaborators.length > 0 && (
                                <Badge variant="info" size="sm">{collaborators.length}</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {collaborators.length > 0 ? (
                            <div className="space-y-1">
                                {collaborators.map((collaborator) => (
                                    <div
                                        key={collaborator.id}
                                        className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 border border-gray-200"
                                    >
                                        <div>
                                            <p className="text-body font-medium text-gray-700">
                                                {collaborator.name}
                                            </p>
                                            <p className="text-label text-gray-500">
                                                {collaborator.email}
                                                {collaborator.createdAt && (
                                                    <> · Desde {formatDate(collaborator.createdAt)}</>
                                                )}
                                            </p>
                                        </div>
                                        {isOwner && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemoveCollaborator(collaborator)}
                                                disabled={isPending}
                                                className="text-gray-600 hover:text-error hover:border-error-light"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<Users className="w-6 h-6" />}
                                title="Sem colaboradores"
                                description={
                                    isOwner
                                        ? "Convide residentes para colaborar na gestão do edifício."
                                        : "Este edifício ainda não tem colaboradores."
                                }
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-secondary-light border-gray-200">
                    <CardContent className="py-1.5">
                        <h4 className="text-subtitle font-medium text-gray-700 mb-1">
                            O que podem fazer os colaboradores?
                        </h4>
                        <ul className="space-y-0.5 text-label text-gray-600">
                            <li className="flex items-start gap-1">
                                <span className="text-primary mt-0.5">✓</span>
                                Ver e gerir quotas e pagamentos
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-primary mt-0.5">✓</span>
                                Criar e gerir eventos, votações e discussões
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-primary mt-0.5">✓</span>
                                Gerir ocorrências
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-primary mt-0.5">✓</span>
                                Ver relatórios e documentos
                            </li>
                        </ul>
                        <h4 className="text-subtitle font-medium text-gray-700 mt-1.5 mb-1">
                            O que NÃO podem fazer?
                        </h4>
                        <ul className="space-y-0.5 text-label text-gray-600">
                            <li className="flex items-start gap-1">
                                <span className="text-error mt-0.5">✗</span>
                                Remover residentes do edifício
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-error mt-0.5">✗</span>
                                Apagar o edifício
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-error mt-0.5">✗</span>
                                Gerir subscrição e faturação
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-error mt-0.5">✗</span>
                                Convidar ou remover outros colaboradores
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={() => {
                    confirmModal.action()
                    setConfirmModal(prev => ({ ...prev, isOpen: false }))
                }}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Confirmar"
                cancelText="Cancelar"
                variant={confirmModal.variant}
                loading={isPending}
            />
        </div>
    )
}
