import { Activity } from "lucide-react"
import { Panel } from "@/components/ui/Panel"
import type { SessionUser } from "@/lib/types"
import { PushNotificationToggle } from "@/features/dashboard/notifications/PushNotificationToggle"

interface SystemStatusPanelProps {
    sessionUser: SessionUser
}

export function SystemStatusPanel({ sessionUser }: SystemStatusPanelProps) {
    return (
        <Panel
            title="Estado do Sistema"
            icon={Activity}
            className="h-full border border-slate-300 shadow-[4px_4px_0px_#cbd5e1]"
            contentClassName="p-0"
        >
            <div className="p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-body text-slate-500 font-bold uppercase">Função</span>
                    <span className="status-badge status-active">{sessionUser.role}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-body text-slate-500 font-bold uppercase">Conta</span>
                    <div className="flex items-center gap-1 text-body font-mono text-slate-700">
                        {sessionUser.email.split('@')[0]}...
                    </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-body text-slate-500 font-bold uppercase">Sincronização</span>
                    <div className="flex items-center gap-1 text-label font-bold text-emerald-600 uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Ativa
                    </div>
                </div>
                <PushNotificationToggle />
            </div>
        </Panel>
    )
}
