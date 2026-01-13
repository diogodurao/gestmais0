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
    bg: "bg-[#E8F0EA]",
    text: "text-[#6A9B72]",
    border: "border-[#D4E5D7]",
  },
  pending: {
    bg: "bg-[#FBF6EC]",
    text: "text-[#B8963E]",
    border: "border-[#F0E4C8]",
  },
  overdue: {
    bg: "bg-[#F9ECEE]",
    text: "text-[#B86B73]",
    border: "border-[#EFCDD1]",
  },
  empty: {
    bg: "bg-[#F1F3F5]",
    text: "text-[#ADB5BD]",
    border: "border-[#E9ECEF]",
  },
  default: {
    bg: "bg-[#F8F9FA]",
    text: "text-[#495057]",
    border: "border-[#E9ECEF]",
  },
}

const sizeStyles = {
  sm: {
    wrapper: "w-6 h-6 text-[9px]",
    floor: "text-[7px]",
  },
  md: {
    wrapper: "w-8 h-8 text-[11px]",
    floor: "text-[8px]",
  },
  lg: {
    wrapper: "w-10 h-10 text-[12px]",
    floor: "text-[9px]",
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
            <span className={cn("text-[#8E9AAF]", sizeStyle.floor)}>
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
              "font-medium text-[#495057] truncate block",
              size === "sm" ? "text-[10px]" : "text-[11px]"
            )}>
              {residentName}
            </span>
          ) : (
            <span className={cn(
              "text-[#ADB5BD] italic",
              size === "sm" ? "text-[9px]" : "text-[10px]"
            )}>
              Sem residente
            </span>
          )}
          {showDebt && debtAmount > 0 && (
            <span className={cn(
              "text-[#B86B73]",
              size === "sm" ? "text-[8px]" : "text-[9px]"
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
