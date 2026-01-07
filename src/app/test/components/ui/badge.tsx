import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "success" | "warning" | "error" | "info"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
)

Badge.displayName = "Badge"
