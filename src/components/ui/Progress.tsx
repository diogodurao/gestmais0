import { cn } from "@/lib/utils"

type ProgressVariant = "default" | "success" | "warning" | "error" | "info"
type ProgressSize = "sm" | "md" | "lg"

interface ProgressProps {
  value: number
  max?: number
  size?: ProgressSize
  variant?: ProgressVariant
  showLabel?: boolean
  className?: string
}

const sizeStyles: Record<ProgressSize, string> = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
}

const variantStyles: Record<ProgressVariant, string> = {
  default: "bg-primary",
  success: "bg-primary",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-gray-600",
}

// Dynamic variant based on value
function getAutoVariant(percentage: number): ProgressVariant {
  if (percentage >= 100) return "success"
  if (percentage >= 50) return "warning"
  return "error"
}

export function Progress({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-0.5">
          <span className="text-xs text-secondary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          "w-full overflow-hidden rounded-full bg-gray-200",
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Auto-colored progress (changes color based on value)
interface AutoProgressProps extends Omit<ProgressProps, "variant"> {
  thresholds?: { warning: number; success: number }
}

export function AutoProgress({
  value,
  max = 100,
  size = "md",
  showLabel = false,
  thresholds = { warning: 50, success: 100 },
  className,
}: AutoProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  let variant: ProgressVariant = "error"
  if (percentage >= thresholds.success) variant = "success"
  else if (percentage >= thresholds.warning) variant = "warning"

  return (
    <Progress
      value={value}
      max={max}
      size={size}
      variant={variant}
      showLabel={showLabel}
      className={className}
    />
  )
}

// Labeled Progress (with label above)
interface LabeledProgressProps extends ProgressProps {
  label: string
}

export function LabeledProgress({
  label,
  value,
  max = 100,
  size = "md",
  variant = "default",
  className,
}: LabeledProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn("", className)}>
      <div className="mb-0.5 flex justify-between text-label">
        <span className="text-secondary">{label}</span>
        <span className="font-medium text-gray-700">{Math.round(percentage)}%</span>
      </div>
      <Progress value={value} max={max} size={size} variant={variant} />
    </div>
  )
}
