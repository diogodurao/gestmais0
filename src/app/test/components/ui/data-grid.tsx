import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DataGridProps {
  columns?: 2 | 3 | 4
  gap?: "sm" | "md"
  children: ReactNode
  className?: string
}

const columnStyles = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}

const gapStyles = {
  sm: "gap-2",
  md: "gap-4",
}

export function DataGrid({ columns = 3, gap = "md", children, className }: DataGridProps) {
  return (
    <div className={cn("grid", columnStyles[columns], gapStyles[gap], className)}>
      {children}
    </div>
  )
}

interface DataGridItemProps {
  label: string
  value: ReactNode
  className?: string
}

export function DataGridItem({ label, value, className }: DataGridItemProps) {
  return (
    <div className={cn("rounded-md border border-gray-200 bg-white p-3", className)}>
      <dt className="text-[11px] font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-[14px] font-medium text-gray-900">{value}</dd>
    </div>
  )
}
