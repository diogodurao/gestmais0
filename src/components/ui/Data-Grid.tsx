import { memo, type ReactNode } from "react"
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
  sm: "gap-1.5",
  md: "gap-1.5",
}

function DataGridComponent({ columns = 3, gap = "md", children, className }: DataGridProps) {
  return (
    <div className={cn("grid", columnStyles[columns], gapStyles[gap], className)}>
      {children}
    </div>
  )
}

export const DataGrid = memo(DataGridComponent)

interface DataGridItemProps {
  label: string
  value: ReactNode
  className?: string
}

function DataGridItemComponent({ label, value, className }: DataGridItemProps) {
  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white p-1.5", className)}>
      <dt className="text-body font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-heading font-medium text-gray-900">{value}</dd>
    </div>
  )
}

export const DataGridItem = memo(DataGridItemComponent)