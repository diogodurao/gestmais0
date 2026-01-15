import { CheckCircle2, CreditCard, FileText, Bell } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { List, ListItem } from "@/components/ui/List"
import { StatusIndicator } from "@/components/ui/Status-indicator"
import { InfoRow } from "@/components/ui/Info-Row"
import { Badge } from "@/components/ui/Badge"
import { PushNotificationToggle } from "@/components/dashboard/notifications/PushNotificationToggle"

interface SystemStatusPanelProps {
    subscriptionStatus?: string | null
}

export function SystemStatusPanel({ subscriptionStatus }: SystemStatusPanelProps) {
    const status = subscriptionStatus || "active"
    const subscriptionConfig: Record<string, { label: string; variant: "success" | "warning" | "error" }> = {
        active: { label: "Ativa", variant: "success" },
        expiring: { label: "Expira em breve", variant: "warning" },
        expired: { label: "Expirada", variant: "error" },
        trialing: { label: "Período de teste", variant: "warning" },
        canceled: { label: "Cancelada", variant: "error" },
        past_due: { label: "Pagamento em atraso", variant: "warning" },
    }

    const subConfig = subscriptionConfig[status] || subscriptionConfig.active

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
                        trailing={<StatusIndicator status="ok" showDot />}
                    />
                    <ListItem
                        title="Documentos"
                        description="Armazenamento"
                        leading={<FileText className="w-4 h-4 text-[#8E9AAF]" />}
                        trailing={<StatusIndicator status="ok" showDot />}
                    />
                    <ListItem
                        title="Notificações"
                        description="Envio de alertas"
                        leading={<Bell className="w-4 h-4 text-[#8E9AAF]" />}
                        trailing={<StatusIndicator status="ok" showDot />}
                    />
                </List>

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

                {/* Push Notifications Toggle */}
                <div className="mt-2">
                    <PushNotificationToggle />
                </div>
            </CardContent>
        </Card>
    )
}
