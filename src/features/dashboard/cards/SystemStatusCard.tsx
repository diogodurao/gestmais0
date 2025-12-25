"use client"

import { CardHeader, CardTitle } from "@/components/ui/Card"
import { Activity } from "lucide-react"
import { SessionUser } from "@/lib/types"

interface SystemStatusCardProps {
    user: SessionUser
}

export function SystemStatusCard({ user }: SystemStatusCardProps) {
    return (
        <div className="col-span-1 border-r border-slate-200 p-0 h-full flex flex-col">
            <CardHeader>
                <CardTitle>
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    SYSTEM_STATUS
                </CardTitle>
            </CardHeader>
            <div className="p-4 space-y-3 flex-1">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-[11px] text-slate-500 font-bold uppercase">Role</span>
                    <span className="status-badge status-active">{user.role}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-[11px] text-slate-500 font-bold uppercase">Account</span>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700">
                        {user.email.split('@')[0]}...
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-bold uppercase">Sync</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Live
                    </div>
                </div>
            </div>
        </div>
    )
}
