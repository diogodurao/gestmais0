import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "success" | "warning" | "error" | "info"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  success: "bg-primary-light text-primary-dark border-primary",
  warning: "bg-warning-light text-warning border-warning",
  error: "bg-error-light text-error border-error",
  info: "bg-secondary-light text-gray-600 border-gray-300",
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded border px-1 py-0.5 text-label font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
)

Badge.displayName = "Badge"
