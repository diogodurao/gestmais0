"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Building2, Check, X, Clock, User } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/Empty-State"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useToast } from "@/components/ui/Toast"
import { CollaboratorInvitation } from "@/lib/types"
import {
    acceptCollaboratorInvitation,
    declineCollaboratorInvitation
} from "@/lib/actions/collaborators"
import { cn } from "@/lib/utils"

interface InvitationsPageClientProps {
    invitations: CollaboratorInvitation[]
}

export function InvitationsPageClient({
    invitations
}: InvitationsPageClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { addToast } = useToast()
    const [isPending, startTransition] = useTransition()

    // Check if there's a token in the URL (from email link)
    const tokenFromUrl = searchParams.get('token')

    // Confirm modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        title: string
        message: string
        action: () => void
        variant: "neutral" | "danger"
        confirmText: string
    }>({
        isOpen: false,
        title: "",
        message: "",
        action: () => { },
        variant: "neutral",
        confirmText: "Confirmar"
    })

    const handleAccept = (invitation: CollaboratorInvitation) => {
        setConfirmModal({
            isOpen: true,
            title: "Aceitar Convite",
            message: `Ao aceitar, passará a colaborar na gestão do edifício "${invitation.buildingName}". Poderá ajudar a gerir quotas, eventos, votações e muito mais.`,
            variant: "neutral",
            confirmText: "Aceitar Convite",
            action: () => {
                startTransition(async () => {
                    const result = await acceptCollaboratorInvitation(invitation.token)
                    if (result.success) {
                        addToast({
                            variant: "success",
                            title: "Convite aceite!",
                            description: `Agora é colaborador do edifício "${result.data.buildingName}"`
                        })
                        router.refresh()
                        // Redirect to dashboard after accepting
                        router.push('/dashboard')
                    } else {
                        addToast({ variant: "error", title: result.error })
                    }
                })
            }
        })
    }

    const handleDecline = (invitation: CollaboratorInvitation) => {
        setConfirmModal({
            isOpen: true,
            title: "Recusar Convite",
            message: `Tem a certeza que pretende recusar o convite para colaborar no edifício "${invitation.buildingName}"?`,
            variant: "danger",
            confirmText: "Recusar",
            action: () => {
                startTransition(async () => {
                    const result = await declineCollaboratorInvitation(invitation.token)
                    if (result.success) {
                        addToast({ variant: "success", title: "Convite recusado" })
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

    const getDaysUntilExpiry = (expiresAt: Date | string) => {
        const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
        const now = new Date()
        const diffTime = expiry.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    // Find invitation from URL token
    const highlightedInvitation = tokenFromUrl
        ? invitations.find(inv => inv.token === tokenFromUrl)
        : null

    return (
        <div className="flex-1 overflow-y-auto p-1.5">
            {/* Header */}
            <div className="mb-1.5">
                <h1 className="text-heading font-semibold text-gray-800">
                    Convites
                </h1>
                <p className="text-label text-gray-500">
                    Convites para colaborar na gestão de edifícios
                </p>
            </div>

            <div className="space-y-1.5">
                {/* Highlighted invitation from email link */}
                {highlightedInvitation && (
                    <Card className="border-primary bg-primary-light/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-1.5 text-primary-dark">
                                <Mail className="w-4 h-4" />
                                Convite Recebido
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InvitationCard
                                invitation={highlightedInvitation}
                                onAccept={handleAccept}
                                onDecline={handleDecline}
                                isPending={isPending}
                                formatDate={formatDate}
                                getDaysUntilExpiry={getDaysUntilExpiry}
                                highlighted
                            />
                        </CardContent>
                    </Card>
                )}

                {/* All Pending Invitations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            Convites Pendentes
                            {invitations.length > 0 && (
                                <Badge variant="warning" size="sm">{invitations.length}</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {invitations.length > 0 ? (
                            <div className="space-y-1.5">
                                {invitations
                                    .filter(inv => inv.token !== tokenFromUrl) // Don't show highlighted one again
                                    .map((invitation) => (
                                        <InvitationCard
                                            key={invitation.id}
                                            invitation={invitation}
                                            onAccept={handleAccept}
                                            onDecline={handleDecline}
                                            isPending={isPending}
                                            formatDate={formatDate}
                                            getDaysUntilExpiry={getDaysUntilExpiry}
                                        />
                                    ))}
                                {invitations.length === 1 && tokenFromUrl && (
                                    <p className="text-label text-gray-500 text-center py-2">
                                        Não tem outros convites pendentes.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<Mail className="w-6 h-6" />}
                                title="Sem convites pendentes"
                                description="Não tem convites para colaborar em nenhum edifício de momento."
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-secondary-light border-gray-200">
                    <CardContent className="py-1.5">
                        <h4 className="text-subtitle font-medium text-gray-700 mb-1">
                            O que é um colaborador?
                        </h4>
                        <p className="text-label text-gray-600 mb-1.5">
                            Um colaborador é um residente que ajuda o administrador na gestão do edifício.
                            Ao aceitar um convite, continuará a ser residente mas terá acesso a funcionalidades
                            de gestão adicionais.
                        </p>
                        <h4 className="text-subtitle font-medium text-gray-700 mb-1">
                            O que pode fazer como colaborador?
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
                confirmText={confirmModal.confirmText}
                cancelText="Cancelar"
                variant={confirmModal.variant}
                loading={isPending}
            />
        </div>
    )
}

// Invitation Card Component
interface InvitationCardProps {
    invitation: CollaboratorInvitation
    onAccept: (invitation: CollaboratorInvitation) => void
    onDecline: (invitation: CollaboratorInvitation) => void
    isPending: boolean
    formatDate: (date: Date | string) => string
    getDaysUntilExpiry: (date: Date | string) => number
    highlighted?: boolean
}

function InvitationCard({
    invitation,
    onAccept,
    onDecline,
    isPending,
    formatDate,
    getDaysUntilExpiry,
    highlighted
}: InvitationCardProps) {
    const daysLeft = getDaysUntilExpiry(invitation.expiresAt)
    const isExpiringSoon = daysLeft <= 2

    return (
        <div
            className={cn(
                "p-1.5 rounded-lg border",
                highlighted
                    ? "bg-white border-primary"
                    : "bg-gray-50 border-gray-200"
            )}
        >
            <div className="flex items-start justify-between gap-1.5">
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-body font-medium text-gray-800">
                            {invitation.buildingName}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-label text-gray-600">
                            Convidado por {invitation.invitedByUserName}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className={cn(
                            "text-label",
                            isExpiringSoon ? "text-warning font-medium" : "text-gray-500"
                        )}>
                            {daysLeft > 0
                                ? `Expira em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}`
                                : "Expira hoje"}
                        </span>
                    </div>
                </div>

                <div className="flex gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDecline(invitation)}
                        disabled={isPending}
                        className="text-gray-600 hover:text-error hover:border-error-light"
                    >
                        <X className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onAccept(invitation)}
                        disabled={isPending}
                    >
                        <Check className="w-3.5 h-3.5 mr-0.5" />
                        Aceitar
                    </Button>
                </div>
            </div>
        </div>
    )
}
