"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"
import { List, ListItem } from "../ui/List"
import { StatusIndicator } from "../ui/Status-Indicator"
import { InfoRow } from "../ui/Info-Row"
import { Badge } from "../ui/Badge"
import { CheckCircle2, CreditCard, FileText, Bell } from "lucide-react"

// Types
export type ServiceStatus = "ok" | "warning" | "error"
export type SubscriptionStatus = "active" | "expiring" | "expired"

export interface SystemStatus {
  payments: ServiceStatus
  documents: ServiceStatus
  notifications: ServiceStatus
  subscription: SubscriptionStatus
}

interface SystemStatusPanelProps {
  status: SystemStatus
}

const subscriptionConfig: Record<SubscriptionStatus, { label: string; variant: "success" | "warning" | "error" }> = {
  active: { label: "Ativa", variant: "success" },
  expiring: { label: "Expira em breve", variant: "warning" },
  expired: { label: "Expirada", variant: "error" },
}

export function SystemStatusPanel({ status }: SystemStatusPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#6A9B72]" />
          </div>
          <div>
            <CardTitle>Estado do Sistema</CardTitle>
            <CardDescription>Monitorização de serviços</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <List variant="divided">
          <ListItem
            title="Pagamentos"
            description="Processamento"
            leading={<CreditCard className="w-4 h-4 text-[#8E9AAF]" />}
            trailing={<StatusIndicator status={status.payments} showDot />}
          />
          <ListItem
            title="Documentos"
            description="Armazenamento"
            leading={<FileText className="w-4 h-4 text-[#8E9AAF]" />}
            trailing={<StatusIndicator status={status.documents} showDot />}
          />
          <ListItem
            title="Notificações"
            description="Envio de alertas"
            leading={<Bell className="w-4 h-4 text-[#8E9AAF]" />}
            trailing={<StatusIndicator status={status.notifications} showDot />}
          />
        </List>

        {/* Subscription Status */}
        <div className="mt-2 p-1.5 rounded-lg bg-[#F8F9FA] border border-[#E9ECEF]">
          <InfoRow
            label="Subscrição"
            value={
              <Badge variant={subscriptionConfig[status.subscription].variant}>
                {subscriptionConfig[status.subscription].label}
              </Badge>
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
