import { cn } from "@/lib/utils"

// ===========================================
// TYPES
// ===========================================

export type ProjectStatus = "active" | "completed" | "cancelled" | "archived"
export type PaymentStatus = "paid" | "pending" | "overdue" | "partial"
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
    overdue: "bg-rose-50 text-rose-700 border-rose-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    
    // Apartment payment statuses
    complete: "bg-emerald-100 text-emerald-700 border-emerald-200",
    
    // Overall statuses
    ok: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    critical: "bg-rose-100 text-rose-700 border-rose-200",
}

const labels: Record<StatusType, string> = {
    // Project statuses
    active: "Ativo",
    completed: "Concluído",
    cancelled: "Cancelado",
    archived: "Arquivado",
    
    // Payment statuses
    paid: "Pago",
    pending: "Pendente",
    overdue: "Atraso",
    partial: "Parcial",
    
    // Apartment payment statuses
    complete: "Liquidado",
    
    // Overall statuses
    ok: "Em dia",
    warning: "Pendente",
    critical: "Em atraso",
}

const sizes = {
    xs: "px-1.5 py-0.5 text-[8px]",
    sm: "px-2 py-0.5 text-[9px]",
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
            {labels[status] || status}
        </span>
    )
}

export default StatusBadge