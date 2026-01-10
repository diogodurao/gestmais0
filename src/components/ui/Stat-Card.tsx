import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  change?: { value: string; positive?: boolean }
  icon?: ReactNode
  className?: string
}

export function StatCard({ label, value, change, icon, className }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white p-1.5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label font-medium text-gray-500">{label}</p>
          <p className="mt-0.5 text-heading font-semibold text-gray-800">{value}</p>
          {change && (
            <p className={cn(
              "mt-0.5 text-label font-medium",
              change.positive ? "text-primary" : "text-error"
            )}>
              {change.positive ? "+" : ""}{change.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded bg-pearl p-1 text-gray-500">{icon}</div>
        )}
      </div>
    </div>
  )
}
