"use client"

import { Building2, Copy, Lock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { can } from "@/lib/permissions"
import type { SessionUser } from "@/lib/types"

interface InviteCodePanelProps {
    isManager: boolean
    sessionUser: SessionUser
    buildingInfo: any
    buildingCode: string
    residentApartment: any
}

export function InviteCodePanel({
    isManager,
    sessionUser,
    buildingInfo,
    buildingCode,
    residentApartment
}: InviteCodePanelProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(buildingCode)
    }

    if (isManager) {
        const canView = can.viewInviteCode(sessionUser, buildingInfo)

        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-[#6A9B72]" />
                        </div>
                        <div className="flex-1">
                            <CardTitle>Código de Convite</CardTitle>
                            <CardDescription>{buildingInfo?.name || "Condomínio"}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {canView ? (
                        <>
                            {/* Code Display */}
                            <div className="rounded-lg bg-[#F8F9FA] border-2 border-dashed border-[#E9ECEF] p-2 text-center">
                                <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1">
                                    Partilhe este código
                                </p>
                                <p className="text-[20px] font-bold font-mono text-[#343A40] tracking-[0.3em]">
                                    {buildingCode}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1.5 mt-2">
                                <Button variant="outline" className="flex-1" onClick={handleCopy}>
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copiar
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="rounded-lg bg-[#F8F9FA] border-2 border-dashed border-[#E9ECEF] p-4 text-center">
                            <Lock className="w-6 h-6 text-[#ADB5BD] mx-auto mb-2" />
                            <p className="text-[10px] font-medium text-[#8E9AAF] uppercase">
                                Subscrição necessária
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    // Resident view
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-[#6A9B72]" />
                    </div>
                    <div>
                        <CardTitle>A Minha Fração</CardTitle>
                        <CardDescription>Sessão de residente ativa</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {residentApartment ? (
                    <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-2 text-center">
                        <p className="text-[20px] font-bold font-mono text-[#343A40]">
                            {residentApartment.unit}
                        </p>
                        <p className="text-[9px] font-medium text-[#8E9AAF] uppercase mt-1">
                            Fração Atribuída
                        </p>
                    </div>
                ) : (
                    <div className="rounded-lg bg-[#F8F9FA] border-2 border-dashed border-[#E9ECEF] p-4 text-center">
                        <p className="text-[10px] font-medium text-[#8E9AAF] uppercase">
                            Sem fração atribuída
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
