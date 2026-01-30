"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Briefcase, Clock, Trash2, X, Mail, UserPlus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/Empty-State"
import { Select } from "@/components/ui/Select"
import { Input } from "@/components/ui/Input"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useToast } from "@/components/ui/Toast"
import {
    inviteProfessional,
    cancelProfessionalInvitation,
    removeProfessional
} from "@/lib/actions/professionals"
import type { ProfessionalInvitation, BuildingProfessional, ProfessionalType } from "@/lib/types"

const PROFESSIONAL_TYPE_LABELS: Record<ProfessionalType, string> = {
    accountant: "Contabilista",
    lawyer: "Advogado",
    consultant: "Consultor",
}

interface ProfessionalsPageClientProps {
    buildingId: string
    professionals: BuildingProfessional[]
    pendingInvitations: ProfessionalInvitation[]
}

export function ProfessionalsPageClient({
    buildingId,
    professionals,
    pendingInvitations,
}: ProfessionalsPageClientProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [isPending, startTransition] = useTransition()

    // Form state
    const [email, setEmail] = useState("")
    const [professionalType, setProfessionalType] = useState<ProfessionalType | "">("")

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
        if (!email.trim()) {
            addToast({ variant: "error", title: "Introduza um email" })
            return
        }
        if (!professionalType) {
            addToast({ variant: "error", title: "Selecione o tipo de profissional" })
            return
        }

        const typeLabel = PROFESSIONAL_TYPE_LABELS[professionalType]

        setConfirmModal({
            isOpen: true,
            title: "Enviar Convite",
            message: `Tem a certeza que deseja convidar ${email} como ${typeLabel}?`,
            variant: "warning",
            action: () => {
                startTransition(async () => {
                    const result = await inviteProfessional(buildingId, email.trim(), professionalType)
                    if (result.success) {
                        addToast({ variant: "success", title: `Convite enviado com sucesso para ${email}!` })
                        setEmail("")
                        setProfessionalType("")
                        router.refresh()
                    } else {
                        addToast({ variant: "error", title: result.error })
                    }
                })
            }
        })
    }

    const handleCancelInvitation = (invitation: ProfessionalInvitation) => {
        setConfirmModal({
            isOpen: true,
            title: "Cancelar Convite",
            message: `Tem a certeza que pretende cancelar o convite para ${invitation.invitedEmail}?`,
            variant: "warning",
            action: () => {
                startTransition(async () => {
                    const result = await cancelProfessionalInvitation(invitation.id, buildingId)
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

    const handleRemoveProfessional = (professional: BuildingProfessional) => {
        setConfirmModal({
            isOpen: true,
            title: "Remover Profissional",
            message: `Tem a certeza que pretende remover ${professional.userName || professional.userEmail} como profissional? Esta ação não pode ser desfeita.`,
            variant: "danger",
            action: () => {
                startTransition(async () => {
                    const result = await removeProfessional(buildingId, professional.professionalId)
                    if (result.success) {
                        addToast({ variant: "success", title: "Profissional removido" })
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
                    Profissionais Externos
                </h1>
                <p className="text-label text-gray-500">
                    Gerir profissionais externos com acesso de consulta ao edifício
                </p>
            </div>

            <div className="space-y-1.5">
                {/* Invite Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-1.5">
                            <UserPlus className="w-4 h-4" />
                            Convidar Profissional
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-body text-gray-600 mb-1.5">
                            Convide um profissional externo (contabilista, advogado ou consultor) por email.
                            O profissional receberá um link para criar conta e terá acesso de consulta a quotas,
                            quotas extra e documentos.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-1.5 items-end">
                            <div className="flex-1 w-full">
                                <label className="text-label text-gray-500 mb-0.5 block">Email</label>
                                <Input
                                    type="email"
                                    placeholder="email@exemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="w-full sm:w-48">
                                <label className="text-label text-gray-500 mb-0.5 block">Tipo</label>
                                <Select
                                    value={professionalType}
                                    onChange={(e) => setProfessionalType(e.target.value as ProfessionalType | "")}
                                    disabled={isPending}
                                >
                                    <option value="">Selecionar tipo...</option>
                                    <option value="accountant">Contabilista</option>
                                    <option value="lawyer">Advogado</option>
                                    <option value="consultant">Consultor</option>
                                </Select>
                            </div>
                            <Button
                                onClick={handleInvite}
                                disabled={!email.trim() || !professionalType || isPending}
                                size="md"
                            >
                                <Mail className="w-3.5 h-3.5 mr-1" />
                                Enviar Convite
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
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
                                                {invitation.invitedEmail}
                                            </p>
                                            <p className="text-label text-gray-500">
                                                {PROFESSIONAL_TYPE_LABELS[invitation.professionalType]} · Enviado em {formatDate(invitation.createdAt)} · Expira em {formatDate(invitation.expiresAt)}
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

                {/* Current Professionals */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4" />
                            Profissionais Atuais
                            {professionals.length > 0 && (
                                <Badge variant="info" size="sm">{professionals.length}</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {professionals.length > 0 ? (
                            <div className="space-y-1">
                                {professionals.map((professional) => (
                                    <div
                                        key={professional.id}
                                        className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 border border-gray-200"
                                    >
                                        <div>
                                            <p className="text-body font-medium text-gray-700">
                                                {professional.userName || professional.userEmail}
                                            </p>
                                            <p className="text-label text-gray-500">
                                                {professional.userEmail}
                                                {' · '}
                                                {PROFESSIONAL_TYPE_LABELS[professional.professionalType]}
                                                {professional.createdAt && (
                                                    <> · Desde {formatDate(professional.createdAt)}</>
                                                )}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRemoveProfessional(professional)}
                                            disabled={isPending}
                                            className="text-gray-600 hover:text-error hover:border-error-light"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<Briefcase className="w-6 h-6" />}
                                title="Sem profissionais"
                                description="Convide profissionais externos para consultar os dados do edifício."
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-secondary-light border-gray-200">
                    <CardContent className="py-1.5">
                        <h4 className="text-subtitle font-medium text-gray-700 mb-1">
                            O que podem fazer os profissionais externos?
                        </h4>
                        <ul className="space-y-0.5 text-label text-gray-600">
                            <li className="flex items-start gap-1">
                                <span className="text-primary mt-0.5">&#10003;</span>
                                Consultar o mapa de quotas e pagamentos
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-primary mt-0.5">&#10003;</span>
                                Consultar quotas extraordinárias
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-primary mt-0.5">&#10003;</span>
                                Aceder a documentos do edifício
                            </li>
                        </ul>
                        <h4 className="text-subtitle font-medium text-gray-700 mt-1.5 mb-1">
                            O que NAO podem fazer?
                        </h4>
                        <ul className="space-y-0.5 text-label text-gray-600">
                            <li className="flex items-start gap-1">
                                <span className="text-error mt-0.5">&#10007;</span>
                                Editar ou criar qualquer registo
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-error mt-0.5">&#10007;</span>
                                Aceder a definicoes, residentes ou calendario
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-error mt-0.5">&#10007;</span>
                                Ver ocorrencias, votacoes ou discussoes
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
