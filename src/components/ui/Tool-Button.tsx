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
    active: "bg-[#E9ECF0] text-[#495057]",
    inactive: "text-[#8E9AAF]",
  },
  success: {
    active: "bg-[#E8F0EA] text-[#6A9B72]",
    inactive: "text-[#8E9AAF]",
  },
  warning: {
    active: "bg-[#FBF6EC] text-[#B8963E]",
    inactive: "text-[#8E9AAF]",
  },
  error: {
    active: "bg-[#F9ECEE] text-[#B86B73]",
    inactive: "text-[#8E9AAF]",
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
          "flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium transition-colors",
          "hover:bg-[#F8F9FA]",
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
        <span className="text-[9px] font-medium text-[#8E9AAF] mr-1 uppercase tracking-wide">
          {label}
        </span>
      )}
      {children}
    </div>
  )
}
