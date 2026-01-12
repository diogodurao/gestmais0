import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface QuickActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label: string
  description?: string
  variant?: "default" | "success" | "warning" | "primary"
}

const variantStyles = {
  default: {
    bg: "bg-[#F8F9FA]",
    bgHover: "hover:bg-[#E9ECEF]",
    border: "border-[#E9ECEF]",
    iconBg: "bg-[#E9ECEF]",
    iconColor: "text-[#6C757D]",
    textColor: "text-[#495057]",
  },
  success: {
    bg: "bg-[#F8FAF8]",
    bgHover: "hover:bg-[#E8F0EA]",
    border: "border-[#D4E5D7]",
    iconBg: "bg-[#E8F0EA]",
    iconColor: "text-[#6A9B72]",
    textColor: "text-[#495057]",
  },
  warning: {
    bg: "bg-[#FDFBF6]",
    bgHover: "hover:bg-[#FBF6EC]",
    border: "border-[#F0E4C8]",
    iconBg: "bg-[#FBF6EC]",
    iconColor: "text-[#B8963E]",
    textColor: "text-[#495057]",
  },
  primary: {
    bg: "bg-[#F8FAF8]",
    bgHover: "hover:bg-[#E8F0EA]",
    border: "border-[#D4E5D7]",
    iconBg: "bg-[#8FB996]",
    iconColor: "text-white",
    textColor: "text-[#495057]",
  },
}

export const QuickAction = forwardRef<HTMLButtonElement, QuickActionProps>(
  ({
    className,
    icon,
    label,
    description,
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
          "flex items-center gap-1.5 rounded-lg border p-1.5 text-left transition-colors w-full",
          styles.bg,
          styles.bgHover,
          styles.border,
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            styles.iconBg,
            styles.iconColor
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <span className={cn("text-[11px] font-medium block", styles.textColor)}>
            {label}
          </span>
          {description && (
            <span className="text-[9px] text-[#8E9AAF] block truncate">
              {description}
            </span>
          )}
        </div>
      </button>
    )
  }
)

QuickAction.displayName = "QuickAction"

// Quick Action Grid
interface QuickActionGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function QuickActionGrid({
  children,
  columns = 2,
  className,
}: QuickActionGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }

  return (
    <div className={cn("grid gap-1.5", gridCols[columns], className)}>
      {children}
    </div>
  )
}

// Quick Action Card (larger version)
interface QuickActionCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label: string
  description?: string
  value?: string | number
  variant?: "default" | "success" | "warning" | "primary"
}

export const QuickActionCard = forwardRef<HTMLButtonElement, QuickActionCardProps>(
  ({
    className,
    icon,
    label,
    description,
    value,
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
          "flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-colors",
          styles.bg,
          styles.bgHover,
          styles.border,
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center mb-1",
            styles.iconBg,
            styles.iconColor
          )}
        >
          {icon}
        </div>
        {value && (
          <span className={cn("text-[14px] font-semibold", styles.textColor)}>
            {value}
          </span>
        )}
        <span className={cn("text-[10px] font-medium", styles.textColor)}>
          {label}
        </span>
        {description && (
          <span className="text-[9px] text-[#8E9AAF]">{description}</span>
        )}
      </button>
    )
  }
)

QuickActionCard.displayName = "QuickActionCard"
