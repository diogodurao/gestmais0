import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Inbox } from "lucide-react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-6 text-center", className)}>
      <div className="mb-1.5 rounded-full bg-gray-100 p-1.5 text-gray-400">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-heading font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-subtitle text-gray-500">{description}</p>
      )}
      {action && <div className="mt-1.5">{action}</div>}
    </div>
  )
}