import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
    label: string
    value: string | number
    subValue?: string
    variant?: "neutral" | "success" | "warning" | "danger" | "info"
    icon?: LucideIcon
    className?: string
}

export function StatCard({
    label,
    value,
    subValue,
    variant = "neutral",
    icon: Icon,
    className
}: StatCardProps) {
    const variants = {
        neutral: "bg-slate-50 border-slate-200",
        success: "bg-emerald-50 border-emerald-200",
        warning: "bg-amber-50 border-amber-200",
        danger: "bg-rose-50 border-rose-200",
        info: "bg-blue-50 border-blue-200",
    }

    const valueColors = {
        neutral: "text-slate-800",
        success: "text-emerald-700",
        warning: "text-amber-700",
        danger: "text-rose-700",
        info: "text-blue-700",
    }

    return (
        <div className={cn("tech-border p-2 sm:p-3", variants[variant], className)}>
            <div className="flex items-start justify-between">
                <p className="text-micro sm:text-label font-bold text-slate-500 uppercase tracking-tight">
                    {label}
                </p>
                {Icon && <Icon className="w-3 h-3 text-slate-400" />}
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                <p className={cn("text-base sm:text-lg font-bold font-mono", valueColors[variant])}>
                    {value}
                </p>
                {subValue && (
                    <span className="text-label sm:text-body text-slate-500">{subValue}</span>
                )}
            </div>
        </div>
    )
}
