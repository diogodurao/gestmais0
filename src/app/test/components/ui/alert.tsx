import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Info, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react"

type AlertVariant = "info" | "success" | "warning" | "error"

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
}

const variantStyles: Record<AlertVariant, { container: string; icon: string }> = {
  info: {
    container: "border-blue-200 bg-blue-50 text-blue-800",
    icon: "text-blue-500",
  },
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: "text-emerald-500",
  },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-800",
    icon: "text-amber-500",
  },
  error: {
    container: "border-red-200 bg-red-50 text-red-800",
    icon: "text-red-500",
  },
}

const icons: Record<AlertVariant, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", title, dismissible, onDismiss, children, ...props }, ref) => {
    const Icon = icons[variant]
    const styles = variantStyles[variant]

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex gap-3 rounded-md border p-3",
          styles.container,
          className
        )}
        {...props}
      >
        <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", styles.icon)} />
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-[13px] font-medium">{title}</p>
          )}
          <div className="text-[13px]">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)

Alert.displayName = "Alert"
