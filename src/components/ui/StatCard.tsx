import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { type Size, type SemanticVariant, SEMANTIC_COLORS } from "@/lib/ui-tokens"

// ===========================================
// TYPES
// ===========================================

interface StatCardProps {
    label: string
    value: string | number
    subValue?: string
    variant?: SemanticVariant
    icon?: LucideIcon | React.ComponentType<{ className?: string }>
    size?: Size
    className?: string
}

// ===========================================
// STYLE MAPS
// ===========================================

const sizes = {
    xs: {
        padding: "p-1.5 sm:p-2",
        label: "text-micro",
        value: "text-base",
        icon: "w-3 h-3",
    },
    sm: {
        padding: "p-2 sm:p-3",
        label: "text-micro sm:text-label",
        value: "text-base sm:text-lg",
        icon: "w-3 sm:w-4 h-3 sm:h-4",
    },
    md: {
        padding: "p-3",
        label: "text-label",
        value: "text-lg",
        icon: "w-4 h-4",
    },
    lg: {
        padding: "p-4",
        label: "text-body",
        value: "text-xl",
        icon: "w-5 h-5",
    },
}

// ===========================================
// COMPONENT
// ===========================================

export function StatCard({
    label,
    value,
    subValue,
    variant = "neutral",
    icon: Icon,
    size = "sm",
    className,
}: StatCardProps) {
    const colors = SEMANTIC_COLORS[variant]
    const s = sizes[size as keyof typeof sizes] || sizes.sm

    return (
        <div className={cn("tech-border", s.padding, colors.bg, className)}>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {Icon && <Icon className={cn(s.icon, colors.text)} />}
                    <span className={cn("font-bold text-slate-500 uppercase tracking-tight", s.label)}>
                        {label}
                    </span>
                </div>
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                <p className={cn("font-bold font-mono", s.value, colors.text)}>
                    {value}
                </p>
                {subValue && (
                    <span className="text-label sm:text-body text-slate-500 whitespace-nowrap">{subValue}</span>
                )}
            </div>
        </div>
    )
}

export default StatCard
