"use client"

import { useState, useTransition } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"
import { Mail, X, Send } from "lucide-react"
import { inviteResidentsByEmail, cancelResidentInvitation } from "@/lib/actions/resident-invitations"
import type { ResidentInvitation } from "@/lib/types"

interface ResidentInviteSectionProps {
    buildingId: string
    pendingInvitations: ResidentInvitation[]
}

export function ResidentInviteSection({ buildingId, pendingInvitations }: ResidentInviteSectionProps) {
    const { addToast } = useToast()
    const [isPending, startTransition] = useTransition()
    const [emailsText, setEmailsText] = useState("")
    const [invitations, setInvitations] = useState(pendingInvitations)

    const handleSendInvites = () => {
        const emails = emailsText
            .split(/[,\n]+/)
            .map(e => e.trim())
            .filter(e => e.length > 0)

        if (emails.length === 0) {
            addToast({ variant: "error", title: "Introduza pelo menos um email" })
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const invalidEmails = emails.filter(e => !emailRegex.test(e))
        if (invalidEmails.length > 0) {
            addToast({
                variant: "error",
                title: `Email(s) inválido(s): ${invalidEmails.join(", ")}`
            })
            return
        }

        startTransition(async () => {
            const result = await inviteResidentsByEmail(buildingId, emails)

            if (result.success) {
                const { sent, errors } = result.data

                if (sent > 0) {
                    addToast({
                        variant: "success",
                        title: `${sent} convite${sent > 1 ? "s" : ""} enviado${sent > 1 ? "s" : ""} com sucesso`
                    })
                    setEmailsText("")
                }

                if (errors.length > 0) {
                    for (const error of errors) {
                        addToast({ variant: "error", title: error })
                    }
                }

                // Refresh the pending invitations list by refetching
                // The page will revalidate, but update local state optimistically
                if (sent > 0) {
                    // Add new invitations to local state (simplified - server will revalidate)
                    window.location.reload()
                }
            } else {
                addToast({ variant: "error", title: result.error })
            }
        })
    }

    const handleCancel = (invitationId: number) => {
        startTransition(async () => {
            const result = await cancelResidentInvitation(invitationId, buildingId)

            if (result.success) {
                addToast({ variant: "success", title: "Convite cancelado" })
                setInvitations(prev => prev.filter(i => i.id !== invitationId))
            } else {
                addToast({ variant: "error", title: result.error })
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    Convidar Residentes por Email
                </CardTitle>
            </CardHeader>

            <CardContent>
                <p className="text-label text-gray-500 mb-3">
                    Alternativa ao código de edifício. Envie convites por email para os residentes se juntarem diretamente.
                </p>

                {/* Email input area */}
                <div className="space-y-2">
                    <textarea
                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                        rows={3}
                        placeholder="Introduza os emails separados por virgula ou nova linha"
                        value={emailsText}
                        onChange={(e) => setEmailsText(e.target.value)}
                        disabled={isPending}
                    />

                    <Button
                        onClick={handleSendInvites}
                        disabled={isPending || !emailsText.trim()}
                        loading={isPending}
                        size="sm"
                    >
                        <Send className="w-3 h-3 mr-1" />
                        Enviar Convites
                    </Button>
                </div>

                {/* Pending invitations list */}
                {invitations.length > 0 && (
                    <div className="mt-4">
                        <p className="text-label font-medium text-gray-600 mb-2">
                            Convites Pendentes ({invitations.length})
                        </p>
                        <div className="space-y-1.5">
                            {invitations.map((inv) => (
                                <div
                                    key={inv.id}
                                    className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-100"
                                >
                                    <div>
                                        <span className="text-body text-gray-700">
                                            {inv.invitedEmail}
                                        </span>
                                        <span className="text-label text-gray-400 ml-2">
                                            {new Date(inv.createdAt).toLocaleDateString('pt-PT')}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCancel(inv.id)}
                                        disabled={isPending}
                                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-error transition-colors"
                                        title="Cancelar convite"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
