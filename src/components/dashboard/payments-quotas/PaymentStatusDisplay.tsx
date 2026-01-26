import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { type PaymentStatusSummary } from "@/lib/actions/payment-status"
import { Alert } from "@/components/ui/Alert"

interface PaymentStatusDisplayProps {
    data: PaymentStatusSummary
    className?: string
}

export function PaymentStatusDisplay({ data, className }: PaymentStatusDisplayProps) {
    const hasExtraProjects = data.extraordinaryQuotas.activeProjects > 0
    const prefix = data.isBuildingSummary ? "O condomínio tem" : "Tem"

    // Regular quotas status
    const regBalance = data.regularQuotas.balance
    const regOverdue = data.regularQuotas.overdueMonths
    const regVariant = regBalance <= 0 ? "success" : regOverdue > 2 ? "error" : "warning"
    const regMessage = regBalance > 0
        ? `${prefix} ${formatCurrency(regBalance)} em quotas pendentes.`
        : "Quotas de condomínio em dia."

    // Extraordinary quotas status
    const extraBalance = data.extraordinaryQuotas.balance
    const extraOverdue = data.extraordinaryQuotas.overdueInstallments
    const extraVariant = extraBalance <= 0 ? "success" : extraOverdue > 2 ? "error" : "warning"
    const extraMessage = extraBalance > 0
        ? `${prefix} ${formatCurrency(extraBalance)} em obras pendentes.`
        : "Pagamentos de obras em dia."

    const label = data.isBuildingSummary ? "Estado Geral" : `Fração ${data.apartmentUnit}`

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            <div className="flex items-center gap-1.5 text-label font-medium text-secondary uppercase tracking-wide">
                {label}
            </div>
            <Alert variant={regVariant} className="w-full h-fit">
                {regMessage}
            </Alert>
            {hasExtraProjects && (
                <Alert variant={extraVariant} className="w-full h-fit">
                    {extraMessage}
                </Alert>
            )}
        </div>
    )
}