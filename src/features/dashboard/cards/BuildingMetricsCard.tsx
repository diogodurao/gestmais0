"use client"

import { CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { BarChart3 } from "lucide-react"

interface BuildingMetricsCardProps {
    isManager: boolean
    residentCount?: number
    unclaimedCount?: number
    totalApartments?: number
    residentBuildingInfo?: {
        building: { name: string }
        manager: { name: string }
    } | null
}

export function BuildingMetricsCard({
    isManager,
    residentCount = 0,
    unclaimedCount = 0,
    totalApartments = 0,
    residentBuildingInfo
}: BuildingMetricsCardProps) {
    const occupancyRate = totalApartments > 0
        ? Math.round(((totalApartments - unclaimedCount) / totalApartments) * 100)
        : 0

    return (
        <div className="col-span-1 p-0 h-full flex flex-col">
            <CardHeader>
                <CardTitle>
                    <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                    {isManager ? "MÉTRICAS_EDIFÍCIO" : "INFO_EDIFÍCIO"}
                </CardTitle>
            </CardHeader>
            <div className="p-4 flex-1 flex flex-col justify-center min-h-[128px]">
                {isManager ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center border-r border-slate-100">
                            <div className="text-2xl font-bold text-slate-700">{residentCount}</div>
                            <div className="text-[9px] text-slate-400 uppercase font-bold mt-1 tracking-tighter">
                                Residentes
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-600">{unclaimedCount}</div>
                            <div className="text-[9px] text-amber-600/70 uppercase font-bold mt-1 tracking-tighter">
                                Não Atribuídas
                            </div>
                        </div>
                    </div>
                ) : residentBuildingInfo ? (
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-800 truncate uppercase">
                            {residentBuildingInfo.building.name}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                            Gestor: {residentBuildingInfo.manager.name}
                        </p>
                    </div>
                ) : null}
            </div>
            <CardFooter className="text-center uppercase">
                {isManager
                    ? `${occupancyRate}% TAXA_OCUPAÇÃO`
                    : "METADADOS_EDIFÍCIO_CARREGADOS"}
            </CardFooter>
        </div>
    )
}