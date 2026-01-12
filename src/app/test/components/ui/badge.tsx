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
  default: "bg-[#F1F3F5] text-[#495057] border-[#E9ECEF]",
  success: "bg-[#E8F0EA] text-[#6A9B72] border-[#D4E5D7]",
  warning: "bg-[#FBF6EC] text-[#B8963E] border-[#F0E4C8]",
  error: "bg-[#F9ECEE] text-[#B86B73] border-[#EFCDD1]",
  info: "bg-[#E9ECF0] text-[#6C757D] border-[#DEE2E6]",
  // Payment status variants
  paid: "bg-[#E8F0EA] text-[#6A9B72] border-[#D4E5D7]",
  pending: "bg-[#FBF6EC] text-[#B8963E] border-[#F0E4C8]",
  overdue: "bg-[#F9ECEE] text-[#B86B73] border-[#EFCDD1]",
  // Status variants
  active: "bg-[#E8F0EA] text-[#6A9B72] border-[#D4E5D7]",
  inactive: "bg-[#F1F3F5] text-[#6C757D] border-[#E9ECEF]",
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-0.5 py-0 text-[8px]",
  md: "px-1 py-0.5 text-[9px]",
  lg: "px-1.5 py-0.5 text-[10px]",
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
      default: "bg-[#6C757D]",
      success: "bg-[#8FB996]",
      warning: "bg-[#B8963E]",
      error: "bg-[#B86B73]",
      info: "bg-[#6C757D]",
      paid: "bg-[#8FB996]",
      pending: "bg-[#B8963E]",
      overdue: "bg-[#B86B73]",
      active: "bg-[#8FB996]",
      inactive: "bg-[#ADB5BD]",
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
