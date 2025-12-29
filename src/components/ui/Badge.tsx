import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"
import {
    Check,
    AlertCircle,
    Clock,
    Info,
    X,
    LucideIcon
} from "lucide-react"

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral" | "outline"
type BadgeSize = "xs" | "sm" | "md"

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant
    size?: BadgeSize
    icon?: LucideIcon | "auto"
    dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    error: "bg-rose-100 text-rose-700 border-rose-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
    outline: "bg-white text-slate-600 border-slate-300",
}

const autoIcons: Record<BadgeVariant, LucideIcon | null> = {
    success: Check,
    warning: AlertCircle,
    error: X,
    info: Info,
    neutral: null,
    outline: null,
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "neutral", size = "sm", icon, dot, children, ...props }, ref) => {
        const IconComponent = icon === "auto" ? autoIcons[variant] : icon

        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center gap-1 font-bold uppercase tracking-wider border rounded-sm",
                    variantStyles[variant],
                    {
                        "h-4 px-1 text-micro": size === "xs",
                        "h-5 px-1.5 text-micro": size === "sm",
                        "h-6 px-2 text-[10px]": size === "md",
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
                            },
                            {
                                "bg-green-500": variant === "success",
                                "bg-amber-500": variant === "warning",
                                "bg-rose-500": variant === "error",
                                "bg-blue-500": variant === "info",
                                "bg-slate-400": variant === "neutral" || variant === "outline",
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
                            }
                        )}
                    />
                )}
                {children}
            </span>
        )
    }
)
Badge.displayName = "Badge"

export { Badge }