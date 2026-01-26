import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react"

type StatusType = "success" | "warning" | "error" | "info" | "pending" | "active" | "inactive" | "ok"

interface StatusIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  status: StatusType
  showIcon?: boolean
  showDot?: boolean
  label?: string
  size?: "sm" | "md" | "lg"
}

const statusConfig: Record<StatusType, {
  bg: string
  text: string
  border: string
  dot: string
  icon: React.ElementType
  label: string
}> = {
  success: {
    bg: "bg-primary-light",
    text: "text-primary-dark",
    border: "border-primary-light",
    dot: "bg-primary",
    icon: CheckCircle,
    label: "Sucesso",
  },
  warning: {
    bg: "bg-warning-light",
    text: "text-warning",
    border: "border-warning-light",
    dot: "bg-warning",
    icon: AlertTriangle,
    label: "Aviso",
  },
  error: {
    bg: "bg-error-light",
    text: "text-error",
    border: "border-error-light",
    dot: "bg-error",
    icon: XCircle,
    label: "Erro",
  },
  info: {
    bg: "bg-gray-200",
    text: "text-gray-500",
    border: "border-gray-300",
    dot: "bg-gray-500",
    icon: AlertTriangle,
    label: "Info",
  },
  pending: {
    bg: "bg-warning-light",
    text: "text-warning",
    border: "border-warning-light",
    dot: "bg-warning",
    icon: Clock,
    label: "Pendente",
  },
  active: {
    bg: "bg-primary-light",
    text: "text-primary-dark",
    border: "border-primary-light",
    dot: "bg-primary",
    icon: CheckCircle,
    label: "Ativo",
  },
  inactive: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
    dot: "bg-gray-400",
    icon: XCircle,
    label: "Inativo",
  },
  ok: {
    bg: "bg-primary-light",
    text: "text-primary-dark",
    border: "border-primary-light",
    dot: "bg-primary",
    icon: CheckCircle,
    label: "Operacional",
  },
}

const sizeConfig = {
  sm: {
    dot: "w-1.5 h-1.5",
    icon: "h-3 w-3",
    text: "text-label",
    padding: "px-1 py-0.5",
  },
  md: {
    dot: "w-2 h-2",
    icon: "h-3.5 w-3.5",
    text: "text-body",
    padding: "px-1.5 py-0.5",
  },
  lg: {
    dot: "w-2.5 h-2.5",
    icon: "h-4 w-4",
    text: "text-body",
    padding: "px-2 py-1",
  },
}

export const StatusIndicator = forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({
    className,
    status,
    showIcon = false,
    showDot = true,
    label,
    size = "md",
    ...props
  }, ref) => {
    const config = statusConfig[status]
    const sizes = sizeConfig[size]
    const Icon = config.icon
    const displayLabel = label || config.label

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded border font-medium",
          config.bg,
          config.text,
          config.border,
          sizes.padding,
          sizes.text,
          className
        )}
        {...props}
      >
        {showDot && !showIcon && (
          <span className={cn("rounded-full", config.dot, sizes.dot)} />
        )}
        {showIcon && (
          <Icon className={sizes.icon} />
        )}
        {displayLabel}
      </div>
    )
  }
)

StatusIndicator.displayName = "StatusIndicator"

// Export status dot only
export const StatusDot = forwardRef<HTMLSpanElement, {
  status: StatusType
  size?: "sm" | "md" | "lg"
  className?: string
}>(({ status, size = "md", className }, ref) => {
  const config = statusConfig[status]
  const sizes = sizeConfig[size]

  return (
    <span
      ref={ref}
      className={cn("rounded-full", config.dot, sizes.dot, className)}
    />
  )
})

StatusDot.displayName = "StatusDot"
