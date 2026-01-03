import { BarChart3 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"

interface BuildingMetricsPanelProps {
    isManager: boolean
    residents: Array<any>
    unclaimedUnits: Array<any>
    residentBuildingInfo: any
    totalApartments?: number
}

export function BuildingMetricsPanel({
    isManager,
    residents,
    unclaimedUnits,
    residentBuildingInfo,
    totalApartments
}: BuildingMetricsPanelProps) {

    // Calculate real occupancy
    const totalUnits = totalApartments || (residents?.length || 0) + (unclaimedUnits?.length || 0) || 1
    const residentCount = residents?.length || 0
    const occupancyRate = totalUnits > 0 ? Math.round((residentCount / totalUnits) * 100) : 0

    return (
        <Card className="h-full border border-slate-300 shadow-[4px_4px_0px_#cbd5e1]">
            <CardHeader>
                <CardTitle>
                    <BarChart3 className="w-4 h-4" />
                    {isManager ? 'Métricas do Condomínio' : 'Informações do Condomínio'}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="p-4 h-32 flex flex-col justify-center">
                    {isManager ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center border-r border-slate-100">
                                <div className="text-2xl font-bold text-slate-700">{residents.length}</div>
                                <div className="text-micro text-slate-400 uppercase font-bold mt-1 tracking-tighter">Residentes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-amber-600">{unclaimedUnits.length}</div>
                                <div className="text-micro text-amber-600/70 uppercase font-bold mt-1 tracking-tighter">não atribuídos</div>
                            </div>
                        </div>
                    ) : residentBuildingInfo ? (
                        <div className="space-y-1">
                            <p className="text-body font-bold text-slate-800 truncate uppercase">{residentBuildingInfo.building.name}</p>
                            <p className="text-label font-medium text-slate-500 uppercase tracking-tighter">Gestor: {residentBuildingInfo.manager.name}</p>
                        </div>
                    ) : null}
                </div>
            </CardContent>
            <CardFooter className="text-center justify-center">
                {isManager ? `${occupancyRate}% Ocupação` : "Metadata do Condomínio Carregados"}
            </CardFooter>
        </Card>
    )
}
