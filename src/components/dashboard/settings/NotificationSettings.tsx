"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Toggle } from "@/components/ui/Toggle"
import { Divider } from "@/components/ui/Divider"
import { Save } from "lucide-react"
import { usePushNotifications } from "@/hooks/usePushNotifications"

interface NotificationPreferences {
    emailPayments: boolean
    emailOccurrences: boolean
    emailPolls: boolean
    pushEnabled: boolean
}

export function NotificationSettings() {
    const { isSubscribed, loading: pushLoading, subscribeToPush } = usePushNotifications()
    const [isSaving, setIsSaving] = useState(false)

    const [preferences, setPreferences] = useState<NotificationPreferences>({
        emailPayments: true,
        emailOccurrences: true,
        emailPolls: true,
        pushEnabled: isSubscribed,
    })

    const handleToggle = (key: keyof NotificationPreferences) => {
        if (key === 'pushEnabled' && !preferences.pushEnabled) {
            subscribeToPush()
        }
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        await new Promise(resolve => setTimeout(resolve, 500))
        setIsSaving(false)
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

                    {emailSettings.map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-1 border-b border-gray-100">
                            <div>
                                <p className="text-body font-medium text-gray-700">{item.label}</p>
                                <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                            <Toggle
                                checked={preferences[item.key]}
                                onChange={() => handleToggle(item.key)}
                            />
                        </div>
                    ))}

                    <Divider className="my-1.5" />

                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Notificações Push
                    </p>

                    <div className="flex items-center justify-between py-1">
                        <div>
                            <p className="text-body font-medium text-gray-700">Ativar notificações push</p>
                            <p className="text-xs text-gray-500">Receber notificações no browser</p>
                        </div>
                        <Toggle
                            checked={preferences.pushEnabled || isSubscribed}
                            onChange={() => handleToggle("pushEnabled")}
                            disabled={pushLoading}
                        />
                    </div>
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