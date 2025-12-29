import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { type PaymentStatusSummary } from "@/app/actions/payment-status"
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
        iconBg: "bg-emerald-50",
        iconBorder: "border-emerald-200",
        iconColor: "text-emerald-600",
    },
    warning: {
        iconBg: "bg-none",
        iconBorder: "border-none",
        iconColor: "text-red-600",
    },
    critical: {
        iconBg: "bg-rose-50",
        iconBorder: "none",
        iconColor: "text-rose-600",
    },
}

export function PaymentStatusDisplay({ data, className }: PaymentStatusDisplayProps) {
    const hasExtraProjects = data.extraordinaryQuotas.activeProjects > 0

    // --- HELPER TO GET STATUS FOR A SECTION ---
    const getSectionStatus = (balance: number, overdueCount: number) => {
        if (balance <= 0 && overdueCount === 0) return "ok"
        if (overdueCount <= 2 && balance < 50000) return "warning"
        return "critical"
    }

    // --- REGULAR QUOTAS DATA ---
    const regBalance = data.regularQuotas.balance
    const regOverdue = data.regularQuotas.overdueMonths
    const regStatus = getSectionStatus(regBalance, regOverdue)
    const regMsg = regBalance > 0
        ? `Faltam ${formatCurrency(regBalance)} em quotas.`
        : "Quotas de condomínio em dia."

    // --- EXTRA QUOTAS DATA ---
    const extraBalance = data.extraordinaryQuotas.balance
    const extraOverdue = data.extraordinaryQuotas.overdueInstallments
    const extraStatus = getSectionStatus(extraBalance, extraOverdue)
    const extraMsg = extraBalance > 0
        ? `Faltam ${formatCurrency(extraBalance)} em obras.`
        : "Pagamentos de obras em dia."

    // --- RENDER COMPONENT FOR A SINGLE ROW ---
    const StatusRow = ({ status, label, message, isLast = false }: { status: string, label: string, message: string, isLast?: boolean }) => {
        const Icon = STATUS_ICONS[status] || AlertCircle
        const styles = STATUS_STYLES[status as keyof typeof STATUS_STYLES] || STATUS_STYLES.critical

        return (
            <div className={cn("flex items-start gap-4", !isLast && "mb-4 pb-4 border-b border-slate-100")}>
                <div className={cn(
                    "w-10 h-10 flex items-center justify-center border shrink-0",
                    styles.iconBg,
                    styles.iconBorder
                )}>
                    <Icon className={cn("w-5 h-5", styles.iconColor)} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm text-slate-500 bg-slate-100"
                        )}>
                            {label}
                        </span>
                    </div>
                    <h3 className="font-bold text-slate-900 uppercase tracking-tighter text-sm leading-tight">
                        {message}
                    </h3>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "bg-white border border-slate-300 shadow-[4px_4px_0px_#cbd5e1] p-4",
            className
        )}>
            {/* Header Badge (Unit or Building) */}
            <div className="mb-4 flex">
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm",
                    data.isBuildingSummary
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-amber-100 text-amber-700"
                )}>
                    {data.isBuildingSummary ? "Estado do Condomínio" : `Fração ${data.apartmentUnit}`}
                </span>
            </div>

            {/* Content Rows */}
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
