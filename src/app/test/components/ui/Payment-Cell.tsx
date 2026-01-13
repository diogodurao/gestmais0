import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type PaymentStatus = "paid" | "pending" | "late"

interface PaymentCellProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  status: PaymentStatus
  amount?: number
  label?: string
  interactive?: boolean
  showAmount?: boolean
  size?: "sm" | "md" | "lg"
}

const statusStyles: Record<PaymentStatus, {
  bg: string
  text: string
  border: string
  symbol: string
  label: string
}> = {
  paid: {
    bg: "bg-[#E8F0EA]",
    text: "text-[#6A9B72]",
    border: "border-[#D4E5D7]",
    symbol: "✓",
    label: "Pago",
  },
  pending: {
    bg: "bg-white",
    text: "text-[#ADB5BD]",
    border: "border-[#E9ECEF]",
    symbol: "—",
    label: "Pendente",
  },
  late: {
    bg: "bg-[#F9ECEE]",
    text: "text-[#B86B73]",
    border: "border-[#EFCDD1]",
    symbol: "!",
    label: "Dívida",
  },
}

const sizeStyles = {
  sm: {
    cell: "h-5 text-[8px]",
    amount: "text-[8px]",
  },
  md: {
    cell: "h-6 text-[9px]",
    amount: "text-[9px]",
  },
  lg: {
    cell: "h-8 text-[10px]",
    amount: "text-[10px]",
  },
}

function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`
}

export const PaymentCell = forwardRef<HTMLButtonElement, PaymentCellProps>(
  ({
    className,
    status,
    amount,
    label,
    interactive = false,
    showAmount = false,
    size = "md",
    disabled,
    ...props
  }, ref) => {
    const styles = statusStyles[status]
    const sizes = sizeStyles[size]

    const displayContent = showAmount && amount && status === "paid"
      ? formatCurrency(amount)
      : label || (status === "late" ? "DÍVIDA" : styles.symbol)

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || !interactive}
        className={cn(
          "w-full flex items-center justify-center rounded font-medium transition-all",
          styles.bg,
          styles.text,
          sizes.cell,
          interactive && "cursor-crosshair hover:ring-1 hover:ring-[#8FB996]",
          !interactive && "cursor-default",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {displayContent}
      </button>
    )
  }
)

PaymentCell.displayName = "PaymentCell"

// Mobile Payment Cell (for card grids)
interface MobilePaymentCellProps extends PaymentCellProps {
  monthLabel?: string
}

export const MobilePaymentCell = forwardRef<HTMLButtonElement, MobilePaymentCellProps>(
  ({
    className,
    status,
    monthLabel,
    interactive = false,
    disabled,
    ...props
  }, ref) => {
    const styles = statusStyles[status]

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || !interactive}
        className={cn(
          "p-1.5 text-center transition-all border rounded",
          styles.bg,
          `border-[${styles.border.replace('border-', '')}]`,
          interactive && "cursor-pointer active:scale-95",
          !interactive && "cursor-default",
          disabled && "opacity-50",
          className
        )}
        {...props}
      >
        {monthLabel && (
          <div className="text-[8px] font-medium text-[#8E9AAF]">{monthLabel}</div>
        )}
        <div className={cn("text-[10px] font-bold mt-0.5", styles.text)}>
          {styles.symbol}
        </div>
      </button>
    )
  }
)

MobilePaymentCell.displayName = "MobilePaymentCell"

// Payment Legend
export function PaymentLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
        <span className="w-2 h-2 bg-[#8FB996] rounded" /> Pago
      </span>
      <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
        <span className="w-2 h-2 bg-[#DEE2E6] rounded" /> Pendente
      </span>
      <span className="flex items-center gap-1 text-[9px] text-[#8E9AAF]">
        <span className="w-2 h-2 bg-[#D4848C] rounded" /> Dívida
      </span>
    </div>
  )
}
