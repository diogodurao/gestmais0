"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Building2, Copy, RefreshCw, Clock } from "lucide-react"

// Types
export interface InviteCodeData {
  code: string
  buildingName: string
  expiresIn?: string
  usageCount: number
  maxUsage?: number
}

interface InviteCodePanelProps {
  data: InviteCodeData
  onCopy: () => void
  onRefresh: () => void
}

export function InviteCodePanel({ data, onCopy, onRefresh }: InviteCodePanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#6A9B72]" />
          </div>
          <div className="flex-1">
            <CardTitle>Código de Convite</CardTitle>
            <CardDescription>{data.buildingName}</CardDescription>
          </div>
          <Badge variant="success">
            {data.usageCount}{data.maxUsage ? `/${data.maxUsage}` : ""} usos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Code Display */}
        <div className="rounded-lg bg-[#F8F9FA] border-2 border-dashed border-[#E9ECEF] p-2 text-center">
          <p className="text-[9px] font-medium text-[#8E9AAF] uppercase tracking-wide mb-1">
            Partilhe este código
          </p>
          <p className="text-[20px] font-bold font-mono text-[#343A40] tracking-[0.3em]">
            {data.code}
          </p>
          {data.expiresIn && (
            <p className="text-[9px] text-[#ADB5BD] mt-1 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Expira em {data.expiresIn}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 mt-2">
          <Button variant="outline" className="flex-1" onClick={onCopy}>
            <Copy className="w-3 h-3 mr-1" />
            Copiar
          </Button>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
