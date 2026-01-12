"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
import { InfoRow } from "../ui/info-row"
import { Building2 } from "lucide-react"

// Types
export interface UnitData {
  building: string
  address: string
  unit: string
  permillage: number
  monthlyQuota: number
}

interface MyUnitPanelProps {
  data: UnitData
}

export function MyUnitPanel({ data }: MyUnitPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#6A9B72]" />
          </div>
          <div>
            <CardTitle>A Minha Fração</CardTitle>
            <CardDescription>{data.building}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] p-1.5 space-y-1">
          <InfoRow
            label="Fração"
            value={<span className="font-mono font-bold text-[#343A40]">{data.unit}</span>}
          />
          <InfoRow
            label="Permilagem"
            value={<span className="font-mono">{data.permillage.toFixed(2)}‰</span>}
          />
          <InfoRow
            label="Quota Mensal"
            value={<span className="font-mono text-[#6A9B72]">€{data.monthlyQuota.toFixed(2)}</span>}
          />
          <InfoRow
            label="Morada"
            value={<span className="text-[10px]">{data.address}</span>}
          />
        </div>
      </CardContent>
    </Card>
  )
}
