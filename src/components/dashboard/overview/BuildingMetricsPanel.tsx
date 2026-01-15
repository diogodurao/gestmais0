import { Users, Building2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { InfoRow } from "@/components/ui/Info-Row"

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

    if (isManager) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
                                <Users className="w-4 h-4 text-[#6A9B72]" />
                            </div>
                            <div>
                                <CardTitle>Métricas</CardTitle>
                                <CardDescription>{totalUnits} frações totais</CardDescription>
                            </div>
                        </div>
                        <Badge>{occupancyRate}% ocupação</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-[#E8F0EA] p-2 text-center">
                            <p className="text-[18px] font-bold text-[#6A9B72]">{residentCount}</p>
                            <p className="text-[9px] font-medium text-[#6A9B72] uppercase">Residentes</p>
                        </div>
                        <div className="rounded-lg bg-[#FBF6EC] p-2 text-center">
                            <p className="text-[18px] font-bold text-[#B8963E]">{unclaimedUnits?.length || 0}</p>
                            <p className="text-[9px] font-medium text-[#B8963E] uppercase">Não atribuídos</p>
                        </div>
                    </div>
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
                        <CardTitle>O Meu Condomínio</CardTitle>
                        <CardDescription>Informações do edifício</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {residentBuildingInfo ? (
                    <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5 space-y-1">
                        <InfoRow
                            label="Edifício"
                            value={<span className="font-medium text-[#343A40]">{residentBuildingInfo.building.name}</span>}
                        />
                        <InfoRow
                            label="Gestor"
                            value={<span className="text-[#495057]">{residentBuildingInfo.manager.name}</span>}
                        />
                    </div>
                ) : (
                    <div className="rounded-lg bg-[#F8F9FA] border-2 border-dashed border-[#E9ECEF] p-4 text-center">
                        <p className="text-[10px] font-medium text-[#8E9AAF] uppercase">
                            A carregar...
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
