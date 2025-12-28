import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/extraordinary-calculations"
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
    const StatusIcon = STATUS_ICONS[data.status] || AlertCircle
    const styles = STATUS_STYLES[data.status] || STATUS_STYLES.critical

    return (
        <div className={cn(
            "bg-white border border-slate-300 shadow-[4px_4px_0px_#cbd5e1] p-4",
            className
        )}>
            <div className="flex items-start gap-4">
                <div className={cn(
                    "w-10 h-10 flex items-center justify-center border shrink-0",
                    styles.iconBg,
                    styles.iconBorder
                )}>
                    <StatusIcon className={cn("w-5 h-5", styles.iconColor)} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm",
                            data.isBuildingSummary
                                ? "bg-indigo-100 text-indigo-700"
                                : "text-slate-500 bg-slate-100"
                        )}>
                            {data.isBuildingSummary ? "Estado do Condomínio" : `Fração ${data.apartmentUnit}`}
                        </span>
                    </div>

                    <h3 className="font-bold text-slate-900 uppercase tracking-tighter text-sm leading-tight mb-2">
                        {data.statusMessage}
                    </h3>
                </div>
            </div>
        </div>
    )
}
