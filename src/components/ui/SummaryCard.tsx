import { cn } from "@/lib/utils"

// ===========================================
// TYPES
// ===========================================

export type CardVariant = "success" | "warning" | "danger" | "neutral" | "info"

interface SummaryCardProps {
    label: string
    value: string | number
    subValue?: string
    variant?: CardVariant
    icon?: React.ComponentType<{ className?: string }>
    size?: "sm" | "md" | "lg"
    className?: string
}

// ===========================================
// STYLE MAPS
// ===========================================

const variants: Record<CardVariant, { bg: string; icon: string; value: string }> = {
    success: {
        bg: "bg-emerald-50 border-emerald-200",
        icon: "text-emerald-600",
        value: "text-emerald-700",
    },
    warning: {
        bg: "bg-amber-50 border-amber-200",
        icon: "text-amber-600",
        value: "text-amber-700",
    },
    danger: {
        bg: "bg-rose-50 border-rose-200",
        icon: "text-rose-600",
        value: "text-rose-700",
    },
    neutral: {
        bg: "bg-slate-50 border-slate-200",
        icon: "text-slate-500",
        value: "text-slate-800",
    },
    info: {
        bg: "bg-blue-50 border-blue-200",
        icon: "text-blue-600",
        value: "text-blue-700",
    },
}

const sizes = {
    sm: {
        padding: "p-2 sm:p-3",
        label: "text-[9px] sm:text-[10px]",
        value: "text-base sm:text-lg",
        icon: "w-3 sm:w-4 h-3 sm:h-4",
    },
    md: {
        padding: "p-3",
        label: "text-[10px]",
        value: "text-lg",
        icon: "w-4 h-4",
    },
    lg: {
        padding: "p-4",
        label: "text-[11px]",
        value: "text-xl",
        icon: "w-5 h-5",
    },
}

// ===========================================
// COMPONENT
// ===========================================

export function SummaryCard({
    label,
    value,
    subValue,
    variant = "neutral",
    icon: Icon,
    size = "md",
    className,
}: SummaryCardProps) {
    const v = variants[variant]
    const s = sizes[size]

    return (
        <div className={cn("tech-border", s.padding, v.bg, className)}>
            <div className="flex items-center gap-1.5 sm:gap-2">
                {Icon && <Icon className={cn(s.icon, v.icon)} />}
                <span className={cn("font-bold text-slate-500 uppercase tracking-tight", s.label)}>
                    {label}
                </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
                <p className={cn("font-bold font-mono", s.value, v.value)}>
                    {value}
                </p>
                {subValue && (
                    <span className="text-[11px] text-slate-500">{subValue}</span>
                )}
            </div>
        </div>
    )
}

export default SummaryCard