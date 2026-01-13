"use client"

import { cn } from "@/lib/utils"
import {
  type ApartmentData,
  type ToolType,
  MONTHS,
  MONTHLY_QUOTA,
  formatCurrency,
} from "./types"

// =============================================================================
// DESKTOP PAYMENT TABLE
// Full payment grid table with sticky columns for desktop view
// =============================================================================

interface DesktopPaymentTableProps {
  data: ApartmentData[]
  activeTool: ToolType
  onCellClick: (aptId: number, monthIdx: number) => void
  className?: string
}

export function DesktopPaymentTable({
  data,
  activeTool,
  onCellClick,
  className,
}: DesktopPaymentTableProps) {
  return (
    <div className={cn("hidden sm:block overflow-x-auto rounded-lg border border-gray-200", className)}>
      <table className="w-full border-collapse text-label">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {/* Sticky columns - Unit & Resident */}
            <th className="sticky left-0 z-10 bg-gray-50 px-1.5 py-1 text-left text-xs font-medium uppercase tracking-wide text-gray-500 border-r border-gray-200 w-12">
              Fração
            </th>
            <th className="sticky left-12 z-10 bg-gray-50 px-1.5 py-1 text-left text-xs font-medium uppercase tracking-wide text-gray-500 border-r border-gray-200 w-28">
              Residente
            </th>

            {/* Month columns */}
            {MONTHS.map((month) => (
              <th key={month} className="px-1.5 py-1 text-center text-xs font-medium uppercase tracking-wide text-gray-500 w-12">
                {month}
              </th>
            ))}

            {/* Sticky columns - Totals */}
            <th className="sticky right-16 z-10 bg-gray-50 px-1.5 py-1 text-right text-xs font-medium uppercase tracking-wide text-gray-500 border-l border-gray-200 w-16">
              Pago
            </th>
            <th className="sticky right-0 z-10 bg-gray-50 px-1.5 py-1 text-right text-xs font-medium uppercase tracking-wide text-gray-500 w-16">
              Dívida
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((apt, idx) => (
            <tr
              key={apt.id}
              className={cn(
                "border-b border-gray-100 transition-colors hover:bg-gray-50",
                idx % 2 === 1 && "bg-gray-50"
              )}
            >
              {/* Unit */}
              <td className="sticky left-0 z-10 bg-inherit px-1.5 py-1 font-medium text-gray-800 border-r border-gray-200">
                {apt.unit}
              </td>

              {/* Resident */}
              <td className="sticky left-12 z-10 bg-inherit px-1.5 py-1 text-gray-700 border-r border-gray-200 truncate max-w-28">
                {apt.residentName || <span className="text-gray-400 italic">Sem residente</span>}
              </td>

              {/* Payment cells */}
              {MONTHS.map((_, monthIdx) => {
                const monthNum = monthIdx + 1
                const payment = apt.payments[monthNum]
                const status = payment?.status || "pending"
                const isInteractive = !!activeTool

                return (
                  <td key={monthIdx} className="p-0.5">
                    <button
                      type="button"
                      disabled={!isInteractive}
                      onClick={() => isInteractive && onCellClick(apt.id, monthIdx)}
                      className={cn(
                        "w-full h-6 flex items-center justify-center rounded text-xs font-medium transition-all",
                        status === "paid" && "bg-primary-light text-primary-dark",
                        status === "late" && "bg-error-light text-error",
                        status === "pending" && "text-gray-400",
                        isInteractive && "cursor-crosshair hover:ring-1 hover:ring-primary",
                        !isInteractive && "cursor-default"
                      )}
                    >
                      {status === "paid" ? formatCurrency(payment?.amount || MONTHLY_QUOTA) : status === "late" ? "DÍVIDA" : "-"}
                    </button>
                  </td>
                )
              })}

              {/* Total paid */}
              <td className="sticky right-16 z-10 bg-inherit px-1.5 py-1 text-right font-medium text-primary-dark border-l border-gray-200">
                {formatCurrency(apt.totalPaid)}
              </td>

              {/* Balance/Debt */}
              <td className={cn(
                "sticky right-0 z-10 bg-inherit px-1.5 py-1 text-right font-medium",
                apt.balance > 0 ? "text-error bg-error-light" : "text-gray-400"
              )}>
                {formatCurrency(apt.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// =============================================================================
// PAYMENT GRID SUMMARY
// Footer summary for mobile view
// =============================================================================

interface PaymentGridSummaryProps {
  count: number
  totalCollected: number
  totalOverdue: number
  className?: string
}

export function PaymentGridSummary({
  count,
  totalCollected,
  totalOverdue,
  className,
}: PaymentGridSummaryProps) {
  return (
    <div className={cn("rounded-lg bg-gray-50 border border-gray-200 p-1.5", className)}>
      <div className="flex items-center justify-between text-label font-medium uppercase tracking-wide">
        <span className="text-gray-500">{count} Frações</span>
        <div className="flex items-center gap-2">
          <span className="text-primary-dark">{formatCurrency(totalCollected)} Cobrado</span>
          {totalOverdue > 0 && (
            <span className="text-error">{formatCurrency(totalOverdue)} Dívida</span>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// PAYMENT GRID LEGEND
// Status legend for the payment grid
// =============================================================================

interface PaymentGridLegendProps {
  className?: string
}

export function PaymentGridLegend({ className }: PaymentGridLegendProps) {
  return (
    <div className={cn("flex items-center justify-center gap-3 py-1.5 border-t border-gray-100", className)}>
      <span className="flex items-center gap-1 text-xs text-gray-500">
        <span className="w-2 h-2 bg-primary rounded" /> Pago
      </span>
      <span className="flex items-center gap-1 text-xs text-gray-500">
        <span className="w-2 h-2 bg-gray-300 rounded" /> Pendente
      </span>
      <span className="flex items-center gap-1 text-xs text-gray-500">
        <span className="w-2 h-2 bg-error rounded" /> Em dívida
      </span>
    </div>
  )
}

// =============================================================================
// EDIT MODE INDICATOR
// Shows when edit tool is active
// =============================================================================

interface EditModeIndicatorProps {
  activeTool: string | null
  className?: string
  /** Custom labels for tool types. Falls back to defaults if not provided */
  toolLabels?: Record<string, string>
  /** Custom message prefix. Defaults to "Modo de edição ativo: clique nas células para" */
  messagePrefix?: string
}

const defaultToolLabels: Record<string, string> = {
  markPaid: "marcar como pago",
  markPending: "marcar como pendente",
  markLate: "marcar como em dívida",
  toggle: "alternar estado",
}

export function EditModeIndicator({
  activeTool,
  className,
  toolLabels,
  messagePrefix = "Modo de edição ativo: clique nas células para",
}: EditModeIndicatorProps) {
  if (!activeTool) return null

  const labels = { ...defaultToolLabels, ...toolLabels }
  const label = labels[activeTool] || activeTool

  return (
    <div className={cn("rounded-lg bg-primary-light border border-primary p-1.5 text-center", className)}>
      <span className="text-label font-medium text-primary-dark">
        {messagePrefix} {label}
      </span>
    </div>
  )
}
