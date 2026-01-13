import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface InfoRowProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  size?: "sm" | "md" | "lg"
  direction?: "horizontal" | "vertical"
}

const sizeStyles = {
  sm: {
    label: "text-[9px]",
    value: "text-[9px]",
    icon: "h-3 w-3",
    gap: "gap-0.5",
  },
  md: {
    label: "text-[10px]",
    value: "text-[10px]",
    icon: "h-3.5 w-3.5",
    gap: "gap-1",
  },
  lg: {
    label: "text-[11px]",
    value: "text-[11px]",
    icon: "h-4 w-4",
    gap: "gap-1.5",
  },
}

export const InfoRow = forwardRef<HTMLDivElement, InfoRowProps>(
  ({
    className,
    label,
    value,
    icon,
    size = "md",
    direction = "horizontal",
    ...props
  }, ref) => {
    const sizes = sizeStyles[size]

    if (direction === "vertical") {
      return (
        <div ref={ref} className={cn("", className)} {...props}>
          <p className={cn("font-medium text-[#8E9AAF] uppercase tracking-wide mb-0.5", sizes.label)}>
            {label}
          </p>
          <div className={cn("flex items-center text-[#495057]", sizes.gap)}>
            {icon && <span className={cn("text-[#8E9AAF]", sizes.icon)}>{icon}</span>}
            <span className={cn("font-medium", sizes.value)}>{value}</span>
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between", className)}
        {...props}
      >
        <span className={cn("text-[#8E9AAF]", sizes.label)}>{label}</span>
        <div className={cn("flex items-center", sizes.gap)}>
          {icon && <span className={cn("text-[#8E9AAF]", sizes.icon)}>{icon}</span>}
          <span className={cn("font-medium text-[#495057]", sizes.value)}>{value}</span>
        </div>
      </div>
    )
  }
)

InfoRow.displayName = "InfoRow"

// Info Row Group
interface InfoRowGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  columns?: 1 | 2 | 3
}

export const InfoRowGroup = forwardRef<HTMLDivElement, InfoRowGroupProps>(
  ({ className, children, columns = 1, ...props }, ref) => {
    const gridCols = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
    }

    return (
      <div
        ref={ref}
        className={cn("grid gap-1.5", gridCols[columns], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

InfoRowGroup.displayName = "InfoRowGroup"
