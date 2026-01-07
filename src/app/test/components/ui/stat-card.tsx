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
    <div className={cn("rounded-md border border-gray-200 bg-white p-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-[18px] font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={cn(
              "mt-1 text-[11px] font-medium",
              change.positive ? "text-emerald-600" : "text-red-600"
            )}>
              {change.positive ? "+" : ""}{change.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-md bg-gray-100 p-2 text-gray-600">{icon}</div>
        )}
      </div>
    </div>
  )
}
