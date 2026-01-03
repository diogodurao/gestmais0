import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Check, AlertCircle, Clock, Info, X, LucideIcon } from "lucide-react"
import { type Size, type SemanticVariant, SEMANTIC_COLORS } from "@/lib/ui-tokens"

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: SemanticVariant | "outline" | "neutral"
    status?: string
    config?: Record<string, { label: string; color: string }>
    size?: Size
    icon?: LucideIcon | "auto"
    dot?: boolean
}

const autoIcons: Record<string, LucideIcon | null> = {
    success: Check,
    warning: AlertCircle,
    danger: X,
    info: Info,
    neutral: null,
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "neutral", status, config, size = "sm", icon, dot, children, ...props }, ref) => {
        const isConfig = status && config
        const statusConfig = isConfig ? config[status] : null

        const finalLabel = statusConfig?.label || children

        // Resolve styles
        let finalStyles = ""
        if (statusConfig?.color) {
            finalStyles = statusConfig.color
        } else if (variant === "outline") {
            finalStyles = "bg-white text-slate-600 border-slate-300"
        } else {
            const colors = SEMANTIC_COLORS[variant as SemanticVariant] || SEMANTIC_COLORS.neutral
            finalStyles = `${colors.bg} ${colors.text} ${colors.border}`
        }

        const IconComponent = icon === "auto" ? autoIcons[variant] : icon

        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center gap-1 font-bold uppercase tracking-wider border rounded-sm",
                    finalStyles,
                    {
                        "h-4 px-1 text-micro": size === "xs",
                        "h-5 px-1.5 text-micro": size === "sm",
                        "h-6 px-2 text-label": size === "md",
                        "h-7 px-2.5 text-body": size === "lg",
                    },
                    className
                )}
                {...props}
            >
                {dot && (
                    <span
                        className={cn(
                            "rounded-full shrink-0",
                            {
                                "w-1 h-1": size === "xs",
                                "w-1.5 h-1.5": size === "sm",
                                "w-2 h-2": size === "md",
                                "w-2.5 h-2.5": size === "lg",
                            },
                            {
                                "bg-emerald-500": variant === "success" || finalStyles.includes("green") || finalStyles.includes("emerald"),
                                "bg-amber-500": variant === "warning" || finalStyles.includes("amber") || finalStyles.includes("yellow"),
                                "bg-rose-500": variant === "danger" || finalStyles.includes("rose") || finalStyles.includes("red"),
                                "bg-blue-500": variant === "info" || finalStyles.includes("blue"),
                                "bg-slate-400": variant === "neutral" || variant === "outline" || finalStyles.includes("slate"),
                            }
                        )}
                    />
                )}
                {IconComponent && (
                    <IconComponent
                        className={cn(
                            "shrink-0",
                            {
                                "w-2 h-2": size === "xs",
                                "w-2.5 h-2.5": size === "sm",
                                "w-3 h-3": size === "md",
                                "w-3.5 h-3.5": size === "lg",
                            }
                        )}
                    />
                )}
                {finalLabel}
            </span>
        )
    }
)
Badge.displayName = "Badge"

export { Badge }