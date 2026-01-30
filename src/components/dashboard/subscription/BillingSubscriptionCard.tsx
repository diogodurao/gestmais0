"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"
import { BadgeWithDot } from "@/components/ui/Badge"
import { Alert } from "@/components/ui/Alert"
import { CreditCard, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { SubscribeButton, SyncSubscriptionButton, ManageSubscriptionButton } from "@/components/dashboard/subscription/SubscribeButton"
import { type SubscriptionStatus } from "@/lib/types"
import { DEFAULT_SUBSCRIPTION_PRICE_PER_UNIT } from "@/lib/constants/project"
import { getGracePeriodDaysRemaining } from "@/lib/permissions"

type StateConfig = {
    cardVariant: "default" | "success" | "warning" | "error"
    badgeVariant: "info" | "success" | "warning" | "error"
    badgeText: string
    alertVariant: "info" | "success" | "warning" | "error"
    alertMessage: string
    Icon: typeof CreditCard
}

const stateConfigs: Record<string, StateConfig> = {
    incomplete: {
        cardVariant: "default",
        badgeVariant: "info",
        badgeText: "Incompleto",
        alertVariant: "info",
        alertMessage: "Subscreva para desbloquear todas as funcionalidades.",
        Icon: CreditCard,
    },
    active: {
        cardVariant: "success",
        badgeVariant: "success",
        badgeText: "Ativo",
        alertVariant: "success",
        alertMessage: "Subscrição ativa. Todas as funcionalidades desbloqueadas.",
        Icon: CheckCircle,
    },
    past_due: {
        cardVariant: "warning",
        badgeVariant: "warning",
        badgeText: "Pagamento Atrasado",
        alertVariant: "warning",
        alertMessage: "O seu pagamento está atrasado. Atualize o método de pagamento para evitar suspensão.",
        Icon: AlertTriangle,
    },
    unpaid: {
        cardVariant: "error",
        badgeVariant: "error",
        badgeText: "Suspensa",
        alertVariant: "error",
        alertMessage: "A sua subscrição foi suspensa por falta de pagamento.",
        Icon: XCircle,
    },
}

interface BillingSubscriptionCardProps {
    subscriptionStatus: string | null
    subscriptionPastDueAt?: Date | string | null
    buildingId: string
    totalApartments?: number
    canSubscribe: boolean
    profileComplete: boolean
    buildingComplete: boolean
    pricePerUnit?: number
}

export function BillingSubscriptionCard({
    subscriptionStatus,
    subscriptionPastDueAt,
    buildingId,
    totalApartments = 0,
    canSubscribe,
    profileComplete,
    buildingComplete,
    pricePerUnit = DEFAULT_SUBSCRIPTION_PRICE_PER_UNIT,
}: BillingSubscriptionCardProps) {
    const normalizedStatus = subscriptionStatus || "incomplete"
    const config = stateConfigs[normalizedStatus] || stateConfigs.incomplete

    // Calculate grace period days remaining for past_due status
    const daysRemaining = getGracePeriodDaysRemaining({
        subscriptionStatus,
        subscriptionPastDueAt
    })

    const renderIncompleteContent = () => (
        <div className="space-y-4">
            {canSubscribe ? (
                <div className="flex flex-col gap-4">
                    <SubscribeButton
                        buildingId={buildingId}
                        quantity={totalApartments || 1}
                        pricePerUnit={pricePerUnit}
                    />
                    <SyncSubscriptionButton buildingId={buildingId} />
                </div>
            ) : (
                <div className="p-3 tech-border border-dashed text-center">
                    <p className="text-label text-gray-400 font-bold uppercase tracking-widest">
                        [ {!profileComplete ? "Valide o seu perfil" : !buildingComplete ? "Valide o edifício" : "Insira todas as frações"} para ativar a faturação ]
                    </p>
                </div>
            )}
        </div>
    )

    const renderActiveContent = () => (
        <div className="space-y-4">
            <p className="text-body text-gray-500">Todas as funcionalidades estão disponíveis.</p>
            <ManageSubscriptionButton buildingId={buildingId} />
        </div>
    )

    const renderPastDueContent = () => (
        <div className="space-y-4">
            {daysRemaining !== null && daysRemaining > 0 && (
                <p className="text-body text-warning font-medium">
                    Tem {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} para atualizar o pagamento antes da suspensão.
                </p>
            )}
            {daysRemaining !== null && daysRemaining === 0 && (
                <p className="text-body text-error font-medium">
                    Último dia para atualizar o pagamento antes da suspensão.
                </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
                <ManageSubscriptionButton buildingId={buildingId} />
                <SyncSubscriptionButton buildingId={buildingId} />
            </div>
        </div>
    )

    const renderUnpaidContent = () => (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <ManageSubscriptionButton buildingId={buildingId} variant="urgent" />
            </div>
            <p className="text-label text-gray-500">
                Se precisar de ajuda, contacte o suporte.
            </p>
        </div>
    )

    const renderContent = () => {
        switch (normalizedStatus) {
            case "active":
                return renderActiveContent()
            case "past_due":
                return renderPastDueContent()
            case "unpaid":
                return renderUnpaidContent()
            default:
                return renderIncompleteContent()
        }
    }

    return (
        <Card variant={config.cardVariant}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    Subscrição
                </CardTitle>
                <BadgeWithDot variant={config.badgeVariant} size="md">
                    {config.badgeText}
                </BadgeWithDot>
            </CardHeader>

            <CardContent className="space-y-4">
                <Alert variant={config.alertVariant}>
                    {config.alertMessage}
                </Alert>

                {renderContent()}
            </CardContent>

            <CardFooter className="text-label text-gray-400">
                Processado por Stripe
            </CardFooter>
        </Card>
    )
}