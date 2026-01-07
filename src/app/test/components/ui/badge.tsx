import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "success" | "warning" | "error" | "info"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[#F1F3F5] text-[#495057] border-[#E9ECEF]",
  success: "bg-[#E8F0EA] text-[#6A9B72] border-[#D4E5D7]",
  warning: "bg-[#FBF6EC] text-[#B8963E] border-[#F0E4C8]",
  error: "bg-[#F9ECEE] text-[#B86B73] border-[#EFCDD1]",
  info: "bg-[#E9ECF0] text-[#6C757D] border-[#DEE2E6]",
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
)

Badge.displayName = "Badge"
