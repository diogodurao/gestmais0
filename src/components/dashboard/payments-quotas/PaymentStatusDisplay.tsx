import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { type PaymentStatusSummary } from "@/lib/actions/payment-status"
import {
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    type LucideIcon
} from "lucide-react"

interface PaymentStatusDisplayProps {
    data: PaymentStatusSummary
    className?: string
}

const STATUS_ICONS: Record<string, LucideIcon> = {
    ok: CheckCircle,
    warning: AlertTriangle,
    critical: AlertCircle,
}

const STATUS_STYLES = {
    ok: {
        iconBg: "bg-[var(--color-primary-light)]", // Spring Rain Light
        iconColor: "text-[var(--color-primary-dark)]", // Spring Rain Dark
    },
    warning: {
        iconBg: "bg-[var(--color-warning-light)]", // Warning Light
        iconColor: "text-[var(--color-warning)]", // Warning Main
    },
    critical: {
        iconBg: "bg-[var(--color-error-light)]", // Error Light
        iconColor: "text-[var(--color-error)]", // Error Main
    },
}

export function PaymentStatusDisplay({ data, className }: PaymentStatusDisplayProps) {
    const hasExtraProjects = data.extraordinaryQuotas.activeProjects > 0

    // Logic remains the same
    const getSectionStatus = (balance: number, overdueCount: number) => {
        if (balance <= 0 && overdueCount === 0) return "ok"
        if (overdueCount <= 2 && balance < 50000) return "warning"
        return "critical"
    }

    const regBalance = data.regularQuotas.balance
    const regOverdue = data.regularQuotas.overdueMonths
    const regStatus = getSectionStatus(regBalance, regOverdue)
    const regMsg = regBalance > 0
        ? `Faltam ${formatCurrency(regBalance)} em quotas.`
        : "Quotas de condomínio em dia."

    const extraBalance = data.extraordinaryQuotas.balance
    const extraOverdue = data.extraordinaryQuotas.overdueInstallments
    const extraStatus = getSectionStatus(extraBalance, extraOverdue)
    const extraMsg = extraBalance > 0
        ? `Faltam ${formatCurrency(extraBalance)} em obras.`
        : "Pagamentos de obras em dia."

    const StatusRow = ({ status, label, message, isLast = false }: { status: string, label: string, message: string, isLast?: boolean }) => {
        const Icon = STATUS_ICONS[status] || AlertCircle
        const styles = STATUS_STYLES[status as keyof typeof STATUS_STYLES] || STATUS_STYLES.critical

        return (
            <div className={cn("flex items-start gap-3", !isLast && "mb-4 pb-4 border-b border-[var(--color-gray-200)]")}>
                <div className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-md shrink-0",
                    styles.iconBg
                )}>
                    <Icon className={cn("w-4 h-4", styles.iconColor)} />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gray-500)]">
                            {label}
                        </span>
                    </div>
                    <h3 className="font-semibold text-[var(--color-gray-800)] text-[13px] leading-tight">
                        {message}
                    </h3>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "bg-white rounded-lg border border-[var(--color-gray-200)] shadow-sm p-4",
            className
        )}>
            {/* Header Badge */}
            <div className="mb-4 flex">
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border",
                    data.isBuildingSummary
                        ? "bg-[var(--color-gray-50)] border-[var(--color-gray-200)] text-[var(--color-gray-700)]"
                        : "bg-[var(--color-warning-light)] border-[var(--color-warning-light)] text-[var(--color-warning)]"
                )}>
                    {data.isBuildingSummary ? "Estado Geral" : `Fração ${data.apartmentUnit}`}
                </span>
            </div>

            <StatusRow
                status={regStatus}
                label="Quotas Mensais"
                message={regMsg}
                isLast={!hasExtraProjects}
            />

            {hasExtraProjects && (
                <StatusRow
                    status={extraStatus}
                    label="Obras Extraordinárias"
                    message={extraMsg}
                    isLast={true}
                />
            )}
        </div>
    )
}