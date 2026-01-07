import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number
  max?: number
  size?: "sm" | "md"
  className?: string
}

const sizeStyles = {
  sm: "h-1",
  md: "h-2",
}

export function Progress({ value, max = 100, size = "md", className }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        "w-full overflow-hidden rounded-full bg-gray-200",
        sizeStyles[size],
        className
      )}
    >
      <div
        className="h-full rounded-full bg-blue-600 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
