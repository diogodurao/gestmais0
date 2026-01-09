import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  variant?: "primary" | "success" | "warning" | "error" | "auto"
  className?: string
}

const sizeStyles = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
}

const variantStyles = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
}

export function Progress({
  value,
  max = 100,
  size = "md",
  variant = "primary",
  className
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  // Auto variant: changes color based on percentage
  let barColor = variantStyles[variant === "auto" ? "primary" : variant]
  if (variant === "auto") {
    if (percentage >= 100) {
      barColor = variantStyles.success
    } else if (percentage >= 75) {
      barColor = variantStyles.primary
    } else if (percentage >= 50) {
      barColor = variantStyles.warning
    } else {
      barColor = variantStyles.error
    }
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        "w-full overflow-hidden rounded-sm bg-gray-200",
        sizeStyles[size],
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-sm transition-all duration-normal",
          barColor
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}