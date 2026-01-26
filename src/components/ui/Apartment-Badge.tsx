import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type ApartmentStatus = "paid" | "pending" | "overdue" | "empty" | "default"

interface ApartmentBadgeProps extends HTMLAttributes<HTMLDivElement> {
  unit: string
  status?: ApartmentStatus
  size?: "sm" | "md" | "lg"
  showFloor?: boolean
  floor?: number
}

const statusStyles: Record<ApartmentStatus, { bg: string; text: string; border: string }> = {
  paid: {
    bg: "bg-primary-light",
    text: "text-primary-dark",
    border: "border-primary-light",
  },
  pending: {
    bg: "bg-warning-light",
    text: "text-warning",
    border: "border-warning-light",
  },
  overdue: {
    bg: "bg-error-light",
    text: "text-error",
    border: "border-error-light",
  },
  empty: {
    bg: "bg-gray-100",
    text: "text-gray-400",
    border: "border-gray-200",
  },
  default: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  },
}

const sizeStyles = {
  sm: {
    wrapper: "w-6 h-6 text-xs",
    floor: "text-micro",
  },
  md: {
    wrapper: "w-8 h-8 text-body",
    floor: "text-micro",
  },
  lg: {
    wrapper: "w-10 h-10 text-base",
    floor: "text-xs",
  },
}

export const ApartmentBadge = forwardRef<HTMLDivElement, ApartmentBadgeProps>(
  ({
    className,
    unit,
    status = "default",
    size = "md",
    showFloor = false,
    floor,
    ...props
  }, ref) => {
    const statusStyle = statusStyles[status]
    const sizeStyle = sizeStyles[size]

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center font-medium rounded border shrink-0",
          statusStyle.bg,
          statusStyle.text,
          statusStyle.border,
          sizeStyle.wrapper,
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center leading-none">
          <span>{unit}</span>
          {showFloor && floor && (
            <span className={cn("text-secondary", sizeStyle.floor)}>
              {floor}º
            </span>
          )}
        </div>
      </div>
    )
  }
)

ApartmentBadge.displayName = "ApartmentBadge"

// Apartment Info (badge + resident info)
interface ApartmentInfoProps extends HTMLAttributes<HTMLDivElement> {
  unit: string
  status?: ApartmentStatus
  residentName?: string | null
  showDebt?: boolean
  debtAmount?: number
  size?: "sm" | "md"
}

function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`
}

export const ApartmentInfo = forwardRef<HTMLDivElement, ApartmentInfoProps>(
  ({
    className,
    unit,
    status = "default",
    residentName,
    showDebt = false,
    debtAmount = 0,
    size = "md",
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1.5", className)}
        {...props}
      >
        <ApartmentBadge unit={unit} status={status} size={size} />
        <div className="min-w-0 flex-1">
          {residentName ? (
            <span className={cn(
              "font-medium text-gray-700 truncate block",
              size === "sm" ? "text-label" : "text-body"
            )}>
              {residentName}
            </span>
          ) : (
            <span className={cn(
              "text-gray-400 italic",
              size === "sm" ? "text-xs" : "text-label"
            )}>
              Sem residente
            </span>
          )}
          {showDebt && debtAmount > 0 && (
            <span className={cn(
              "text-error",
              size === "sm" ? "text-micro" : "text-xs"
            )}>
              Dívida: {formatCurrency(debtAmount)}
            </span>
          )}
        </div>
      </div>
    )
  }
)

ApartmentInfo.displayName = "ApartmentInfo"
