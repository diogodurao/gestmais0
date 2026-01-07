import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number
  max?: number
  size?: "sm" | "md"
  className?: string
}

const sizeStyles = {
  sm: "h-1",
  md: "h-1.5",
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
        "w-full overflow-hidden rounded-full bg-[#E9ECEF]",
        sizeStyles[size],
        className
      )}
    >
      <div
        className="h-full rounded-full bg-[#8FB996] transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
