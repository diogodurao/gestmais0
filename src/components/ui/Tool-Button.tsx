import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type ToolVariant = "default" | "success" | "warning" | "error"

interface ToolButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  label?: string
  active?: boolean
  variant?: ToolVariant
}

const variantStyles: Record<ToolVariant, { active: string; inactive: string }> = {
  default: {
    active: "bg-gray-200 text-gray-700",
    inactive: "text-secondary",
  },
  success: {
    active: "bg-primary-light text-primary-dark",
    inactive: "text-secondary",
  },
  warning: {
    active: "bg-warning-light text-warning",
    inactive: "text-secondary",
  },
  error: {
    active: "bg-error-light text-error",
    inactive: "text-secondary",
  },
}

export const ToolButton = forwardRef<HTMLButtonElement, ToolButtonProps>(
  ({
    className,
    icon,
    label,
    active = false,
    variant = "default",
    disabled,
    ...props
  }, ref) => {
    const styles = variantStyles[variant]

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          "flex items-center gap-1 rounded px-1.5 py-1 text-body font-medium transition-colors",
          "hover:bg-gray-50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          active ? styles.active : styles.inactive,
          className
        )}
        {...props}
      >
        {icon}
        {label && <span className="hidden sm:inline">{label}</span>}
      </button>
    )
  }
)

ToolButton.displayName = "ToolButton"

// Tool Button Group
interface ToolButtonGroupProps {
  children: React.ReactNode
  label?: string
  className?: string
}

export function ToolButtonGroup({ children, label, className }: ToolButtonGroupProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {label && (
        <span className="text-label font-medium text-secondary mr-1 uppercase tracking-wide">
          {label}
        </span>
      )}
      {children}
    </div>
  )
}
