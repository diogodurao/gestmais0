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
    container: "border-[#DEE2E6] bg-[#F8F9FA] text-[#495057]",
    icon: "text-[#8E9AAF]",
  },
  success: {
    container: "border-[#D4E5D7] bg-[#E8F0EA] text-[#495057]",
    icon: "text-[#8FB996]",
  },
  warning: {
    container: "border-[#F0E4C8] bg-[#FBF6EC] text-[#495057]",
    icon: "text-[#E5C07B]",
  },
  error: {
    container: "border-[#EFCDD1] bg-[#F9ECEE] text-[#495057]",
    icon: "text-[#D4848C]",
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
          "flex gap-2 rounded-lg border p-2.5",
          styles.container,
          className
        )}
        {...props}
      >
        <Icon className={cn("h-3.5 w-3.5 flex-shrink-0 mt-0.5", styles.icon)} />
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-[11px] font-medium">{title}</p>
          )}
          <div className="text-[11px]">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  }
)

Alert.displayName = "Alert"
