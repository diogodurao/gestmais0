import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type BadgeVariant =
  | "default" | "success" | "warning" | "error" | "info"
  | "paid" | "pending" | "overdue" | "active" | "inactive"

type BadgeSize = "sm" | "md" | "lg"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  success: "bg-success-light text-primary-dark border-primary-light",
  warning: "bg-warning-light text-warning border-warning-light",
  error: "bg-error-light text-error border-error-light",
  info: "bg-secondary-light text-gray-600 border-gray-300",
  // Payment status variants
  paid: "bg-success-light text-primary-dark border-primary-light",
  pending: "bg-warning-light text-warning border-warning-light",
  overdue: "bg-error-light text-error border-error-light",
  // Status variants
  active: "bg-success-light text-primary-dark border-primary-light",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-0.5 py-0 text-micro",
  md: "px-1 py-0.5 text-xs",
  lg: "px-1.5 py-0.5 text-label",
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded border font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
)

Badge.displayName = "Badge"

// Badge with dot
interface BadgeWithDotProps extends BadgeProps {
  showDot?: boolean
}

export const BadgeWithDot = forwardRef<HTMLSpanElement, BadgeWithDotProps>(
  ({ className, variant = "default", size = "md", showDot = true, children, ...props }, ref) => {
    const dotColors: Record<BadgeVariant, string> = {
      default: "bg-gray-600",
      success: "bg-primary",
      warning: "bg-warning",
      error: "bg-error",
      info: "bg-gray-600",
      paid: "bg-primary",
      pending: "bg-warning",
      overdue: "bg-error",
      active: "bg-primary",
      inactive: "bg-gray-400",
    }

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded border font-medium",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {showDot && (
          <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />
        )}
        {children}
      </span>
    )
  }
)

BadgeWithDot.displayName = "BadgeWithDot"
