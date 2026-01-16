"use client"

import { Building2, Copy, RefreshCw, Clock, Lock, Users } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { InfoRow } from "@/components/ui/Info-Row"
import { Divider } from "@/components/ui/Divider"
import { can } from "@/lib/permissions"
import type { SessionUser } from "@/lib/types"

interface BuildingStatusPanelProps {
    sessionUser: SessionUser
    buildingInfo: {
        id: string
        name: string
        subscriptionStatus?: string | null
        totalApartments?: number | null
    } | null
    buildingCode: string
    residents: Array<any>
    unclaimedUnits: Array<any>
}

const subscriptionConfig: Record<string, { label: string; variant: "success" | "warning" | "error" }> = {
    active: { label: "Ativa", variant: "success" },
    expiring: { label: "Expira em breve", variant: "warning" },
    expired: { label: "Expirada", variant: "error" },
    trialing: { label: "Período de teste", variant: "warning" },
    canceled: { label: "Cancelada", variant: "error" },
    past_due: { label: "Pagamento em atraso", variant: "warning" },
}

export function BuildingStatusPanel({
    sessionUser,
    buildingInfo,
    buildingCode,
    residents,
    unclaimedUnits
}: BuildingStatusPanelProps) {
    const canView = can.viewInviteCode(sessionUser, buildingInfo)
    const status = buildingInfo?.subscriptionStatus || "active"
    const subConfig = subscriptionConfig[status] || subscriptionConfig.active

    // Calculate metrics
    const totalUnits = buildingInfo?.totalApartments || (residents?.length || 0) + (unclaimedUnits?.length || 0) || 1
    const residentCount = residents?.length || 0
    const occupancyRate = totalUnits > 0 ? Math.round((residentCount / totalUnits) * 100) : 0

    const handleCopy = () => {
        navigator.clipboard.writeText(buildingCode)
    }

    const handleRefresh = () => {
        // TODO: Implement code refresh logic
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                        <CardTitle>Gestão do Condomínio</CardTitle>
                        <CardDescription>{buildingInfo?.name || "Condomínio"}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {canView ? (
                    <>
                        {/* Metrics */}
                        <div className="flex items-center gap-1.5 mb-2">
                            <Users className="w-4 h-4 text-[#8E9AAF]" />
                            <span className="text-xs font-medium text-[#8E9AAF] uppercase">Métricas</span>
                            <Badge className="ml-auto">{occupancyRate}% ocupação</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="rounded-lg bg-[#E8F0EA] p-2 text-center">
                                <p className="text-[18px] font-bold text-[#6A9B72]">{residentCount}</p>
                                <p className="text-[9px] font-medium text-[#6A9B72] uppercase">Residentes</p>
                            </div>
                            <div className="rounded-lg bg-[#FBF6EC] p-2 text-center">
                                <p className="text-[18px] font-bold text-[#B8963E]">{unclaimedUnits?.length || 0}</p>
                                <p className="text-[9px] font-medium text-[#B8963E] uppercase">Não atribuídos</p>
                            </div>
                        </div>

                        <Divider className="my-2" />

                        {/* Code Display */}
                        <div className="rounded-lg bg-[#F8F9FA] border-2 border-dashed border-[#E9ECEF] p-2 text-center">
                            <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1">
                                Partilhe este código
                            </p>
                            <p className="text-[20px] font-bold font-mono text-[#343A40] tracking-[0.3em]">
                                {buildingCode}
                            </p>
                            <p className="text-[9px] text-[#ADB5BD] mt-1 flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3" />
                                Regenera automaticamente a cada 30 dias
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1.5 mt-2">
                            <Button variant="outline" className="flex-1" onClick={handleCopy}>
                                <Copy className="w-3 h-3 mr-1" />
                                Copiar
                            </Button>
                            <Button variant="outline" onClick={handleRefresh}>
                                <RefreshCw className="w-3 h-3" />
                            </Button>
                        </div>

                        {/* Subscription Status */}
                        <div className="mt-2 p-1.5 rounded-lg bg-[#F8F9FA] border border-[#E9ECEF]">
                            <InfoRow
                                label="Subscrição"
                                value={
                                    <Badge variant={subConfig.variant}>
                                        {subConfig.label}
                                    </Badge>
                                }
                            />
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