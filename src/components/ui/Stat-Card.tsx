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
    <div className={cn("rounded-lg border border-[#E9ECEF] bg-white p-1.5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium text-[#8E9AAF]">{label}</p>
          <p className="mt-0.5 text-[14px] font-semibold text-[#343A40]">{value}</p>
          {change && (
            <p className={cn(
              "mt-0.5 text-[10px] font-medium",
              change.positive ? "text-[#8FB996]" : "text-[#D4848C]"
            )}>
              {change.positive ? "+" : ""}{change.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded bg-[#F8F8F6] p-1 text-[#8E9AAF]">{icon}</div>
        )}
      </div>
    </div>
  )
}