"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Toggle } from "@/components/ui/Toggle"
import { Divider } from "@/components/ui/Divider"
import { Alert } from "@/components/ui/Alert"
import { useToast } from "@/components/ui/Toast"
import { Save, BellOff } from "lucide-react"
import { usePushNotifications } from "@/hooks/usePushNotifications"

interface NotificationPreferences {
    emailPayments: boolean
    emailOccurrences: boolean
    emailPolls: boolean
    pushEnabled: boolean
}

export function NotificationSettings() {
    const { permission, isSubscribed, loading: pushLoading, error: pushError, subscribeToPush } = usePushNotifications()
    const { addToast } = useToast()
    const [isSaving, setIsSaving] = useState(false)

    const [preferences, setPreferences] = useState<NotificationPreferences>({
        emailPayments: true,
        emailOccurrences: true,
        emailPolls: true,
        pushEnabled: isSubscribed,
    })

    // Sync push toggle with actual subscription status
    useEffect(() => {
        setPreferences(prev => ({ ...prev, pushEnabled: isSubscribed }))
    }, [isSubscribed])

    const handleToggle = (key: keyof NotificationPreferences) => {
        if (key === 'pushEnabled') {
            if (!isSubscribed && permission !== 'denied') {
                subscribeToPush()
            }
            return // Don't update local state for push - it syncs from isSubscribed
        }
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // TODO: Implement server action to save email notification preferences
            await new Promise(resolve => setTimeout(resolve, 500))
            addToast({
                variant: "success",
                title: "Preferências guardadas",
                description: "As suas preferências de notificação foram atualizadas."
            })
        } catch {
            addToast({
                variant: "error",
                title: "Erro",
                description: "Não foi possível guardar as preferências."
            })
        } finally {
            setIsSaving(false)
        }
    }

    const emailSettings = [
        { key: "emailPayments" as const, label: "Pagamentos", desc: "Receber alertas sobre pagamentos recebidos e em falta" },
        { key: "emailOccurrences" as const, label: "Ocorrências", desc: "Notificações sobre novas ocorrências e atualizações" },
        { key: "emailPolls" as const, label: "Votações", desc: "Alertas sobre novas votações e resultados" },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notificações</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Notificações por Email
                    </p>

                    <Alert variant="info">
                        Notificações por email estarão disponíveis em breve.
                    </Alert>

                    <Divider className="my-1.5" />

                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Notificações Push
                    </p>

                    {pushError && (
                        <Alert variant="error" className="mb-1.5">
                            {pushError}
                        </Alert>
                    )}

                    {permission === 'denied' ? (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between py-1">
                                <div>
                                    <p className="text-body font-medium text-gray-700">Notificações push</p>
                                    <p className="text-xs text-gray-500">Bloqueadas nas definições do browser</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium text-error">
                                    <BellOff className="w-3 h-3" />
                                    Bloqueadas
                                </div>
                            </div>
                            <Alert variant="info">
                                Para reativar, clique no ícone de cadeado na barra de endereço do browser e permita notificações para este site.
                            </Alert>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between py-1">
                            <div>
                                <p className="text-body font-medium text-gray-700">Ativar notificações push</p>
                                <p className="text-xs text-gray-500">Receber notificações no browser</p>
                            </div>
                            <Toggle
                                checked={isSubscribed}
                                onChange={() => handleToggle("pushEnabled")}
                                disabled={pushLoading}
                            />
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter>
                <Button className="w-full" onClick={handleSave} loading={isSaving}>
                    <Save className="h-3 w-3 mr-1" /> Guardar Preferências
                </Button>
            </CardFooter>
        </Card>
    )
}