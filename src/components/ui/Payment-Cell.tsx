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
    bg: "bg-primary-light",
    text: "text-primary-dark",
    border: "border-primary-light",
    symbol: "✓",
    label: "Pago",
  },
  pending: {
    bg: "bg-white",
    text: "text-gray-400",
    border: "border-gray-200",
    symbol: "—",
    label: "Pendente",
  },
  late: {
    bg: "bg-error-light",
    text: "text-error",
    border: "border-error-light",
    symbol: "!",
    label: "Dívida",
  },
}

const sizeStyles = {
  sm: {
    cell: "h-5 text-micro",
    amount: "text-micro",
  },
  md: {
    cell: "h-6 text-xs",
    amount: "text-xs",
  },
  lg: {
    cell: "h-8 text-label",
    amount: "text-label",
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
          interactive && "cursor-crosshair hover:ring-1 hover:ring-primary",
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
          <div className="text-micro font-medium text-secondary">{monthLabel}</div>
        )}
        <div className={cn("text-label font-bold mt-0.5", styles.text)}>
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
      <span className="flex items-center gap-1 text-xs text-secondary">
        <span className="w-2 h-2 bg-primary rounded" /> Pago
      </span>
      <span className="flex items-center gap-1 text-xs text-secondary">
        <span className="w-2 h-2 bg-gray-300 rounded" /> Pendente
      </span>
      <span className="flex items-center gap-1 text-xs text-secondary">
        <span className="w-2 h-2 bg-error rounded" /> Dívida
      </span>
    </div>
  )
}
