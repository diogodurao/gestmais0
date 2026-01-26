import { Building2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { InfoRow } from "@/components/ui/Info-Row"

interface MyUnitPanelProps {
    apartment: {
        unit: string
        permillage?: number | null
    } | null
    buildingInfo: {
        building: {
            name: string
            street?: string | null
            number?: string | null
            city?: string | null
            monthlyQuota?: number | null
        }
        manager?: {
            name: string
        }
    } | null
}

export function MyUnitPanel({ apartment, buildingInfo }: MyUnitPanelProps) {
    const building = buildingInfo?.building
    const address = building?.street && building?.city
        ? `${building.street}${building.number ? `, ${building.number}` : ''} - ${building.city}`
        : null

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                        <CardTitle>A Minha Fração</CardTitle>
                        <CardDescription>{building?.name || "Condomínio"}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg bg-gray-100 border border-gray-200 p-1.5 space-y-1">
                    <InfoRow
                        label="Fração"
                        value={
                            <span className="font-mono font-bold text-gray-800">
                                {apartment?.unit || "N/A"}
                            </span>
                        }
                    />
                    {apartment?.permillage && (
                        <InfoRow
                            label="Permilagem"
                            value={
                                <span className="font-mono">
                                    {apartment.permillage.toFixed(2)}‰
                                </span>
                            }
                        />
                    )}
                    {building?.monthlyQuota && (
                        <InfoRow
                            label="Quota Mensal"
                            value={
                                <span className="font-mono text-primary-dark">
                                    €{(building.monthlyQuota / 100).toFixed(2)}
                                </span>
                            }
                        />
                    )}
                    {address && (
                        <InfoRow
                            label="Morada"
                            value={<span className="text-label">{address}</span>}
                        />
                    )}
                    {buildingInfo?.manager && (
                        <InfoRow
                            label="Admin."
                            value={<span className="text-gray-600">{buildingInfo.manager.name}</span>}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}