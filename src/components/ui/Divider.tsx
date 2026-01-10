import { memo } from "react"
import { cn } from "@/lib/utils"

interface DividerProps {
  className?: string
  label?: string
}

function DividerComponent({ className, label }: DividerProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-body text-gray-500">{label}</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
    )
  }

  return <div className={cn("h-px bg-gray-200", className)} />
}

export const Divider = memo(DividerComponent)