"use client"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { ToastAction } from "@/components/ui/Toast"

export function PushNotificationToggle() {
    const { permission, isSubscribed, loading, error, subscribeToPush } = usePushNotifications()
    const { toast } = useToast()

    useEffect(() => {
        if (error) {
            toast({
                variant: "destructive",
                title: "Erro nas notificações",
                description: error,
                action: <ToastAction altText="Tentar novamente">Tentar novamente</ToastAction>,
            })
        }
    }, [error, toast])

    if (permission === 'denied') {
        return (
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-body text-slate-500 font-bold uppercase">Notificações</span>
                <span className="text-label font-bold text-red-500 uppercase flex items-center gap-1">
                    <BellOff className="w-3 h-3" />
                    Bloqueadas
                </span>
            </div>
        )
    }

    if (isSubscribed) {
        return (
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-body text-slate-500 font-bold uppercase">Notificações</span>
                <div className="flex items-center gap-1 text-label font-bold text-emerald-600 uppercase">
                    <Bell className="w-3 h-3" />
                    Ativas
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <span className="text-body text-slate-500 font-bold uppercase">Notificações</span>
            <button
                onClick={subscribeToPush}
                disabled={loading}
                className="flex items-center gap-1 text-label font-bold text-blue-600 hover:text-blue-700 uppercase transition-colors"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <BellOff className="w-3 h-3" />}
                {loading ? 'A ativar...' : 'Ativar'}
            </button>
        </div>
    )
}
