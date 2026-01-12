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
    bg: "bg-[#E8F0EA]",
    text: "text-[#6A9B72]",
    border: "border-[#D4E5D7]",
    dot: "bg-[#8FB996]",
    icon: CheckCircle,
    label: "Sucesso",
  },
  warning: {
    bg: "bg-[#FBF6EC]",
    text: "text-[#B8963E]",
    border: "border-[#F0E4C8]",
    dot: "bg-[#B8963E]",
    icon: AlertTriangle,
    label: "Aviso",
  },
  error: {
    bg: "bg-[#F9ECEE]",
    text: "text-[#B86B73]",
    border: "border-[#EFCDD1]",
    dot: "bg-[#B86B73]",
    icon: XCircle,
    label: "Erro",
  },
  info: {
    bg: "bg-[#E9ECF0]",
    text: "text-[#6C757D]",
    border: "border-[#DEE2E6]",
    dot: "bg-[#6C757D]",
    icon: AlertTriangle,
    label: "Info",
  },
  pending: {
    bg: "bg-[#FBF6EC]",
    text: "text-[#B8963E]",
    border: "border-[#F0E4C8]",
    dot: "bg-[#B8963E]",
    icon: Clock,
    label: "Pendente",
  },
  active: {
    bg: "bg-[#E8F0EA]",
    text: "text-[#6A9B72]",
    border: "border-[#D4E5D7]",
    dot: "bg-[#8FB996]",
    icon: CheckCircle,
    label: "Ativo",
  },
  inactive: {
    bg: "bg-[#F1F3F5]",
    text: "text-[#6C757D]",
    border: "border-[#E9ECEF]",
    dot: "bg-[#ADB5BD]",
    icon: XCircle,
    label: "Inativo",
  },
  ok: {
    bg: "bg-[#E8F0EA]",
    text: "text-[#6A9B72]",
    border: "border-[#D4E5D7]",
    dot: "bg-[#8FB996]",
    icon: CheckCircle,
    label: "Operacional",
  },
}

const sizeConfig = {
  sm: {
    dot: "w-1.5 h-1.5",
    icon: "h-3 w-3",
    text: "text-[9px]",
    padding: "px-1 py-0.5",
  },
  md: {
    dot: "w-2 h-2",
    icon: "h-3.5 w-3.5",
    text: "text-[10px]",
    padding: "px-1.5 py-0.5",
  },
  lg: {
    dot: "w-2.5 h-2.5",
    icon: "h-4 w-4",
    text: "text-[11px]",
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
