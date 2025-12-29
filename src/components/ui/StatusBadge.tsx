import { cn } from "@/lib/utils"
import { PaymentStatus, ProjectStatus } from "@/lib/types"
// ===========================================
// TYPES
// ===========================================

export type ApartmentPaymentStatus = "complete" | "partial" | "pending"
export type OverallStatus = "ok" | "warning" | "critical"

type StatusType = ProjectStatus | PaymentStatus | ApartmentPaymentStatus | OverallStatus

interface StatusBadgeProps {
    status: StatusType
    size?: "xs" | "sm" | "md"
    className?: string
}

// ===========================================
// STYLE MAPS
// ===========================================

const styles: Record<StatusType, string> = {
    // Project statuses
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-slate-100 text-slate-500 border-slate-200",
    archived: "bg-slate-100 text-slate-500 border-slate-200",

    // Payment statuses
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-slate-100 text-slate-500 border-slate-200",
    late: "bg-rose-50 text-rose-700 border-rose-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",

    // Apartment payment statuses
    complete: "bg-emerald-100 text-emerald-700 border-emerald-200",

    // Overall statuses
    ok: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    critical: "bg-rose-100 text-rose-700 border-rose-200",
}

const getLabel = (status: StatusType): string => {
    switch (status) {
        // Project statuses
        case "active": return "Ativo"
        case "completed": return "Concluído"
        case "cancelled": return "Cancelado"
        case "archived": return "Arquivado"

        // Payment statuses
        case "paid": return "Pago"
        case "pending": return "Pendente"
        case "late": return "Atraso"
        case "partial": return "Parcial"

        // Apartment payment statuses
        case "complete": return "Liquidado"

        // Overall statuses
        case "ok": return "Em dia"
        case "warning": return "Pendente"
        case "critical": return "Em atraso"

        default: return status as string
    }
}

const sizes = {
    xs: "px-1.5 py-0.5 text-micro",
    sm: "px-2 py-0.5 text-micro",
    md: "px-2.5 py-1 text-[10px]",
}

// ===========================================
// COMPONENT
// ===========================================

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
    return (
        <span className={cn(
            "inline-block font-bold uppercase tracking-wider border",
            sizes[size],
            styles[status] || styles.pending,
            className
        )}>
            {getLabel(status)}
        </span>
    )
}

export default StatusBadge