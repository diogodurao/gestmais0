"use client"

import { CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { Key, Lock } from "lucide-react"
import { getApartmentDisplayName } from "@/lib/utils"

interface InviteCodeCardProps {
    isManager: boolean
    canViewInvite?: boolean
    inviteCode?: string
    residentApartment?: { id: number; unit: string } | null
}

export function InviteCodeCard({
    isManager,
    canViewInvite = false,
    inviteCode = "N/A",
    residentApartment
}: InviteCodeCardProps) {
    return (
        <div className="col-span-1 border-r border-slate-200 p-0 h-full flex flex-col">
            <CardHeader>
                <CardTitle>
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    {isManager ? 'BUILDING_INVITE_CODE' : 'RESIDENT_ACCESS'}
                </CardTitle>
            </CardHeader>
            <div className="p-6 flex flex-col items-center justify-center bg-blue-50/30 flex-1 min-h-[128px]">
                {isManager ? (
                    canViewInvite ? (
                        <>
                            <div className="text-3xl font-mono font-bold text-blue-700 tracking-widest mb-2 select-all uppercase">
                                {inviteCode}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-blue-600/70">
                                Active Invite Code
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <Lock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                            <span className="text-[10px] uppercase font-bold text-slate-400">Subscription Required</span>
                        </div>
                    )
                ) : residentApartment ? (
                    <>
                        <div className="text-3xl font-mono font-bold text-slate-800 tracking-tight mb-1">
                            {getApartmentDisplayName(residentApartment)}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Assigned_Unit</div>
                    </>
                ) : null}
            </div>
            <CardFooter className="text-center">
                {isManager
                    ? "SHARE CODE WITH NEW RESIDENTS"
                    : "ACTIVE_RESIDENT_SESSION"}
            </CardFooter>
        </div>
    )
}
