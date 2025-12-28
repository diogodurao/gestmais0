import { CardHeader, CardTitle } from "@/components/ui/Card"
import { Activity } from "lucide-react"
import { DashboardCard } from "./components/DashboardCard"
import type { SessionUser } from "@/lib/types"

interface SystemStatusPanelProps {
    sessionUser: SessionUser
}

export function SystemStatusPanel({ sessionUser }: SystemStatusPanelProps) {
    return (
        <DashboardCard>
            <CardHeader>
                <CardTitle>
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    Estado do Sistema
                </CardTitle>
            </CardHeader>
            <div className="p-4 space-y-3 h-32">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-[11px] text-slate-500 font-bold uppercase">Função</span>
                    <span className="status-badge status-active">{sessionUser.role}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-[11px] text-slate-500 font-bold uppercase">Conta</span>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700">
                        {sessionUser.email.split('@')[0]}...
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-bold uppercase">Sincronização</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Ativa
                    </div>
                </div>
            </div>
        </DashboardCard>
    )
}
