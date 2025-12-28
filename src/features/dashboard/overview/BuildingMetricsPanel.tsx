import { CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { BarChart3 } from "lucide-react"
import { DashboardCard } from "./components/DashboardCard"

interface BuildingMetricsPanelProps {
    isManager: boolean
    residents: Array<any>
    unclaimedUnits: Array<any>
    residentBuildingInfo: any
    totalApartments?: number // Helpful for accurate calculation if available
}

export function BuildingMetricsPanel({
    isManager,
    residents,
    unclaimedUnits,
    residentBuildingInfo,
    totalApartments
}: BuildingMetricsPanelProps) {

    // Calculate real occupancy
    // Ideally we use totalApartments. If not, we approximate with residents + unclaimed 
    // (though this misses empty units that are claimed but have no resident, if that state exists)
    // Assuming: 
    // - Unclaimed = Units with no resident attached
    // - Residents = Units with resident attached
    // So Total = Residents + Unclaimed

    // Fallback logic
    const totalUnits = totalApartments || (residents?.length || 0) + (unclaimedUnits?.length || 0) || 1
    const residentCount = residents?.length || 0
    // Prevent division by zero
    const occupancyRate = totalUnits > 0 ? Math.round((residentCount / totalUnits) * 100) : 0

    return (
        <DashboardCard>
            <CardHeader>
                <CardTitle>
                    <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                    {isManager ? 'Métricas do Condomínio' : 'Informações do Condomínio'}
                </CardTitle>
            </CardHeader>
            <div className="p-4 h-32 flex flex-col justify-center">
                {isManager ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center border-r border-slate-100">
                            <div className="text-2xl font-bold text-slate-700">{residents.length}</div>
                            <div className="text-[9px] text-slate-400 uppercase font-bold mt-1 tracking-tighter">Residentes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-600">{unclaimedUnits.length}</div>
                            <div className="text-[9px] text-amber-600/70 uppercase font-bold mt-1 tracking-tighter">não atribuídos</div>
                        </div>
                    </div>
                ) : residentBuildingInfo ? (
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-800 truncate uppercase">{residentBuildingInfo.building.name}</p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">Manager: {residentBuildingInfo.manager.name}</p>
                    </div>
                ) : null}
            </div>
            <CardFooter className="text-center uppercase">
                {isManager
                    ? `${occupancyRate}% Ocupação`
                    : "Metadata do Condomínio Carregados"}
            </CardFooter>
        </DashboardCard>
    )
}
