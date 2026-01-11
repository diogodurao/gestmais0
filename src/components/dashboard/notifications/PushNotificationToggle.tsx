"use client"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import { useEffect } from "react"

export function PushNotificationToggle() {
    const { permission, isSubscribed, loading, error, subscribeToPush } = usePushNotifications()
    const { toast } = useToast()

    useEffect(() => {
        if (error) {
            toast({
                variant: "destructive",
                title: "Erro nas notificações",
                description: error,
                action: {
                    label: "Tentar novamente",
                    onClick: () => subscribeToPush()
                }
            })
        }
    }, [error, toast, subscribeToPush])

    if (permission === 'denied') {
        return (
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-body text-gray-500 font-medium uppercase">Notificações</span>
                <span className="text-label font-medium text-error uppercase flex items-center gap-1">
                    <BellOff className="w-3 h-3" />
                    Bloqueadas
                </span>
            </div>
        )
    }

    if (isSubscribed) {
        return (
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-body text-gray-500 font-medium uppercase">Notificações</span>
                <div className="flex items-center gap-1 text-label font-medium text-success uppercase">
                    <Bell className="w-3 h-3" />
                    Ativas
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-body text-gray-500 font-medium uppercase">Notificações</span>
            <button
                onClick={subscribeToPush}
                disabled={loading}
                className="flex items-center gap-1 text-label font-medium text-primary hover:text-primary-hover uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <BellOff className="w-3 h-3" />}
                {loading ? 'A ativar...' : 'Ativar'}
            </button>
        </div>
    )
}
